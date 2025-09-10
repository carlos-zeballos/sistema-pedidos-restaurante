-- =========================================
-- MÓDULO MÍNIMO DE REPORTES (autocontenible)
-- =========================================
SET search_path = public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1) Campos en Order (original/final/soft delete/delivery)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='originalTotal') THEN
    ALTER TABLE "Order" ADD COLUMN "originalTotal" NUMERIC(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='finalTotal') THEN
    ALTER TABLE "Order" ADD COLUMN "finalTotal" NUMERIC(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='deletedAt') THEN
    ALTER TABLE "Order" ADD COLUMN "deletedAt" TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='deliveryCost') THEN
    ALTER TABLE "Order" ADD COLUMN "deliveryCost" NUMERIC(10,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='isDelivery') THEN
    ALTER TABLE "Order" ADD COLUMN "isDelivery" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END$$;

-- 2) Catálogo de métodos de pago
CREATE TABLE IF NOT EXISTS "PaymentMethod"(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_method_name_ci_uk ON "PaymentMethod"(LOWER(name));

-- 3) Pagos por orden
CREATE TABLE IF NOT EXISTS "OrderPayment"(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "paymentMethodId" UUID NOT NULL REFERENCES "PaymentMethod"(id),
  amount NUMERIC(10,2) NOT NULL,                 -- monto cobrado (base + recargo)
  "baseAmount" NUMERIC(10,2),                    -- opcional: monto antes de recargo
  "surchargeAmount" NUMERIC(10,2) NOT NULL DEFAULT 0, -- recargo por medio/servicio
  "isDeliveryService" BOOLEAN NOT NULL DEFAULT false, -- true si es fee del motorizado
  "paymentDate" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orderpayment_order ON "OrderPayment"("orderId");
CREATE INDEX IF NOT EXISTS idx_orderpayment_method ON "OrderPayment"("paymentMethodId");
CREATE INDEX IF NOT EXISTS idx_orderpayment_isdelivery ON "OrderPayment"("isDeliveryService");

-- 4) Ajustes manuales (opcional)
CREATE TABLE IF NOT EXISTS "OrderAdjustment"(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  reason TEXT,
  amount NUMERIC(10,2) NOT NULL, -- +/-
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_adjustment_order_id ON "OrderAdjustment"("orderId");

-- 5) Semilla de métodos (no duplica)
INSERT INTO "PaymentMethod"(name,description,icon,color) VALUES
  ('EFECTIVO','Pago en efectivo','💵','#065f46'),
  ('YAPE','Pago por Yape','📱','#7c3aed'),
  ('IZIPAY','Pago por IziPay','💳','#6366f1'),
  ('PEDIDOSYA','Pago a través de PedidosYa','🛵','#ef4444'),
  ('TARJETA','Tarjeta presencial','💳','#0ea5e9'),
  ('OTRO','Otro método','❓','#6b7280')
ON CONFLICT (name) DO NOTHING;

-- 6) Totales automáticos en Order (original vs final)
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW."originalTotal" := COALESCE(NEW.subtotal,0) + COALESCE(NEW.tax,0) - COALESCE(NEW.discount,0);
    NEW."finalTotal"    := NEW."originalTotal";
  ELSIF TG_OP = 'UPDATE' THEN
    IF (OLD.subtotal,OLD.tax,OLD.discount) IS DISTINCT FROM (NEW.subtotal,NEW.tax,NEW.discount) THEN
      NEW."originalTotal" := COALESCE(NEW.subtotal,0) + COALESCE(NEW.tax,0) - COALESCE(NEW.discount,0);
      IF NEW."finalTotal" IS NULL THEN
        NEW."finalTotal" := NEW."originalTotal";
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_order_totals ON "Order";
CREATE TRIGGER trigger_calculate_order_totals
  BEFORE INSERT OR UPDATE ON "Order"
  FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

-- 7) Recalcular finalTotal cuando cambian pagos/ajustes
CREATE OR REPLACE FUNCTION recalc_order_final_total(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE "Order" o
  SET "finalTotal" =
      COALESCE(o."originalTotal", COALESCE(o.subtotal,0)+COALESCE(o.tax,0)-COALESCE(o.discount,0))
      + COALESCE((SELECT SUM(a.amount) FROM "OrderAdjustment" a WHERE a."orderId" = p_order_id), 0)
      + COALESCE((SELECT SUM(p."surchargeAmount") FROM "OrderPayment" p WHERE p."orderId" = p_order_id), 0)
      + COALESCE(o."deliveryCost", 0)
  WHERE o.id = p_order_id;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orderpayment_recalc_ins ON "OrderPayment";
CREATE TRIGGER trg_orderpayment_recalc_ins
AFTER INSERT OR UPDATE OR DELETE ON "OrderPayment"
FOR EACH ROW EXECUTE FUNCTION recalc_order_final_total(COALESCE(NEW."orderId", OLD."orderId"));

DROP TRIGGER IF EXISTS trg_orderadjustment_recalc_ins ON "OrderAdjustment";
CREATE TRIGGER trg_orderadjustment_recalc_ins
AFTER INSERT OR UPDATE OR DELETE ON "OrderAdjustment"
FOR EACH ROW EXECUTE FUNCTION recalc_order_final_total(COALESCE(NEW."orderId", OLD."orderId"));

-- 8) Soft delete
CREATE OR REPLACE FUNCTION soft_delete_order(p_order_id UUID, p_reason TEXT DEFAULT 'Eliminado por administrador')
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE "Order" SET "deletedAt" = NOW() WHERE id = p_order_id AND "deletedAt" IS NULL;
  RETURN FOUND;
END; $$ LANGUAGE plpgsql;

-- 9) Vistas de reportes
CREATE OR REPLACE VIEW "PaymentSummaryView" AS
SELECT
  p."paymentMethodId",
  pm.name AS method,
  pm.icon,
  pm.color,
  COUNT(DISTINCT p."orderId") AS ordersCount,
  -- montos considerando recargos:
  SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END) AS finalTotal,
  -- monto "original" estimado (base sin recargo):
  SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false)
           THEN COALESCE(p."baseAmount", p.amount - COALESCE(p."surchargeAmount",0))
           ELSE 0 END) AS originalTotal,
  -- total cobrado por método (sin fees de delivery)
  SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END) AS paidByMethod
FROM "Order" o
JOIN "OrderPayment" p ON p."orderId" = o.id
JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
WHERE o."deletedAt" IS NULL AND pm."isActive" = true
GROUP BY p."paymentMethodId", pm.name, pm.icon, pm.color
ORDER BY pm.name;

CREATE OR REPLACE VIEW "DeliveryPaymentSummaryView" AS
SELECT
  p."paymentMethodId",
  pm.name AS method,
  pm.icon,
  pm.color,
  COUNT(DISTINCT o.id) AS deliveryOrdersCount,
  SUM(CASE WHEN COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END) AS deliveryFeesPaid,
  SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount ELSE 0 END) AS orderTotalsPaid,
  SUM(p.amount) AS totalPaid
FROM "Order" o
JOIN "Space" s ON s.id = o."spaceId" AND s.type = 'DELIVERY'
JOIN "OrderPayment" p ON p."orderId" = o.id
JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
WHERE o."deletedAt" IS NULL AND pm."isActive" = true
GROUP BY p."paymentMethodId", pm.name, pm.icon, pm.color
ORDER BY pm.name;

CREATE OR REPLACE VIEW "OrdersReportView" AS
SELECT
  o.id,
  o."orderNumber",
  o."createdAt",
  s.code AS "spaceCode",
  s.name AS "spaceName",
  s.type AS "spaceType",
  o."customerName",
  o.status,
  (COALESCE(o.subtotal,0) + COALESCE(o.tax,0) - COALESCE(o.discount,0)) AS "originalTotalCalc",
  COALESCE(o."originalTotal", (COALESCE(o.subtotal,0)+COALESCE(o.tax,0)-COALESCE(o.discount,0))) AS "originalTotal",
  COALESCE(o."finalTotal", o."originalTotal", (COALESCE(o.subtotal,0)+COALESCE(o.tax,0)-COALESCE(o.discount,0))) AS "finalTotal",
  COALESCE(SUM(CASE WHEN NOT COALESCE(p."isDeliveryService",false) THEN p.amount END),0) AS "paidTotal",
  COALESCE(SUM(CASE WHEN COALESCE(p."isDeliveryService",false) THEN p.amount END),0) AS "deliveryFeeTotal",
  COALESCE(SUM(p.amount),0) AS "totalPaid",
  JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'method', pm.name,
      'amount', p.amount,
      'isDelivery', COALESCE(p."isDeliveryService",false),
      'paymentDate', p."paymentDate"
    )
  ) FILTER (WHERE p.id IS NOT NULL) AS payments
FROM "Order" o
JOIN "Space" s ON s.id = o."spaceId"
LEFT JOIN "OrderPayment" p ON p."orderId" = o.id
LEFT JOIN "PaymentMethod" pm ON pm.id = p."paymentMethodId"
WHERE o."deletedAt" IS NULL
GROUP BY o.id, s.code, s.name, s.type
ORDER BY o."createdAt" DESC;

-- 10) Índices útiles
CREATE INDEX IF NOT EXISTS idx_order_deleted_at ON "Order"("deletedAt") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS idx_order_created_at_report ON "Order"("createdAt");

-- =====================================================
-- ¡MÓDULO DE REPORTES COMPLETADO!
-- =====================================================
