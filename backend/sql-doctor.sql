-- Limpia versión previa si existiera
DROP FUNCTION IF EXISTS public.diag_catalog_schema();

-- === SQL Doctor (v2) ===
-- Revisa columnas/índices críticos para Category/Product/Space/Combo/ComboComponent
CREATE OR REPLACE FUNCTION public.diag_catalog_schema()
RETURNS TABLE (obj text, chk text, ok boolean, detail text)
LANGUAGE plpgsql
AS $$
DECLARE v boolean;
BEGIN
  -- ===== Category =====
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Category' AND c.column_name='name'
  ) INTO v;  obj:='Category'; chk:='column:name'; ok:=v;
  detail := CASE WHEN v THEN 'OK' ELSE 'Falta columna name' END; RETURN NEXT;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Category' AND c.column_name='isActive'
  ) INTO v;  obj:='Category'; chk:='column:isActive'; ok:=v;
  detail := CASE WHEN v THEN 'OK' ELSE 'Falta isActive (renombrar desde isactive)' END; RETURN NEXT;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Category' AND c.column_name='updatedAt'
  ) INTO v;  obj:='Category'; chk:='column:updatedAt'; ok:=v;
  detail := CASE WHEN v THEN 'OK' ELSE 'Falta updatedAt (renombrar desde updatedat)' END; RETURN NEXT;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes i WHERE i.schemaname='public'
      AND i.indexname IN ('category_name_lower_uk','category_name_ci_uk')
  ) INTO v;  obj:='-'; chk:='index:category_name_lower_uk'; ok:=v;
  detail := CASE WHEN v THEN 'OK' ELSE 'Falta índice ON CONFLICT (lower(name))' END; RETURN NEXT;

  -- ===== Product =====
  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Product' AND c.column_name='code') INTO v;
  obj:='Product'; chk:='column:code'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta code' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Product' AND c.column_name='categoryId') INTO v;
  obj:='Product'; chk:='column:categoryId'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta categoryId (renombrar desde categoryid)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Product' AND c.column_name='preparationTime') INTO v;
  obj:='Product'; chk:='column:preparationTime'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta preparationTime (renombrar desde preparationtime)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Product' AND c.column_name='isEnabled') INTO v;
  obj:='Product'; chk:='column:isEnabled'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta isEnabled (renombrar desde isenabled)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Product' AND c.column_name='isAvailable') INTO v;
  obj:='Product'; chk:='column:isAvailable'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta isAvailable (renombrar desde isavailable)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Product' AND c.column_name='updatedAt') INTO v;
  obj:='Product'; chk:='column:updatedAt'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta updatedAt (renombrar desde updatedat)' END; RETURN NEXT;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes i WHERE i.schemaname='public'
      AND i.indexname IN ('product_code_ci_uk','product_code_lower_uk')
  ) INTO v;  obj:='-'; chk:='index:product_code_lower_uk'; ok:=v;
  detail := CASE WHEN v THEN 'OK' ELSE 'Falta índice ON CONFLICT (lower(code))' END; RETURN NEXT;

  -- ===== Space =====
  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Space' AND c.column_name='isActive') INTO v;
  obj:='Space'; chk:='column:isActive'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta isActive (renombrar desde isactive)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Space' AND c.column_name='updatedAt') INTO v;
  obj:='Space'; chk:='column:updatedAt'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta updatedAt (renombrar desde updatedat)' END; RETURN NEXT;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes i WHERE i.schemaname='public'
      AND i.indexname IN ('space_code_ci_uk','space_code_lower_uk')
  ) INTO v;  obj:='-'; chk:='index:space_code_lower_uk'; ok:=v;
  detail := CASE WHEN v THEN 'OK' ELSE 'Falta índice ON CONFLICT (lower(code))' END; RETURN NEXT;

  -- ===== Combo =====
  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Combo' AND c.column_name='basePrice') INTO v;
  obj:='Combo'; chk:='column:basePrice'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta basePrice (renombrar desde baseprice)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Combo' AND c.column_name='isEnabled') INTO v;
  obj:='Combo'; chk:='column:isEnabled'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta isEnabled (renombrar desde isenabled)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Combo' AND c.column_name='isAvailable') INTO v;
  obj:='Combo'; chk:='column:isAvailable'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta isAvailable (renombrar desde isavailable)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='Combo' AND c.column_name='categoryId') INTO v;
  obj:='Combo'; chk:='column:categoryId'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta categoryId (renombrar desde categoryid)' END; RETURN NEXT;

  -- ===== ComboComponent =====
  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='ComboComponent' AND c.column_name='comboId') INTO v;
  obj:='ComboComponent'; chk:='column:comboId'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta comboId (renombrar desde comboid)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='ComboComponent' AND c.column_name='isRequired') INTO v;
  obj:='ComboComponent'; chk:='column:isRequired'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta isRequired (renombrar desde isrequired)' END; RETURN NEXT;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name='ComboComponent' AND c.column_name='isAvailable') INTO v;
  obj:='ComboComponent'; chk:='column:isAvailable'; ok:=v; detail := CASE WHEN v THEN 'OK' ELSE 'Falta isAvailable (renombrar desde isavailable)' END; RETURN NEXT;

  RETURN;
END;
$$;

-- Ejecuta el diagnóstico (todas las filas)
SELECT * FROM public.diag_catalog_schema() ORDER BY obj, chk;

-- Solo los problemas:
-- SELECT * FROM public.diag_catalog_schema() WHERE NOT ok ORDER BY obj, chk;
