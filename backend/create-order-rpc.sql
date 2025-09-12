-- Atomic order creation with items for Supabase RPC
-- Call with: select * from create_order_with_items(
--   p_space_id := '...', p_created_by := '...', p_customer_name := '...', p_customer_phone := '...',
--   p_total_amount := 0, p_subtotal := 0, p_tax := 0, p_discount := 0, p_notes := '...',
--   p_items := '[{"productId": "...", "comboId": null, "name": "Sushi Roll", "unitPrice": 10.5, "totalPrice": 21, "quantity": 2, "notes": null}]'::jsonb
-- );

create or replace function create_order_with_items(
  p_space_id uuid,
  p_created_by uuid,
  p_customer_name text default null,
  p_customer_phone text default null,
  p_total_amount numeric default 0,
  p_subtotal numeric default 0,
  p_tax numeric default 0,
  p_discount numeric default 0,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb
)
returns table (id uuid, orderNumber text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_counter integer;
begin
  -- Generate order number
  select coalesce(max(cast(substring("orderNumber" from 4) as integer)), 0) + 1
  into v_counter
  from "Order";
  
  v_order_number := 'ORD' || lpad(v_counter::text, 6, '0');
  
  -- Insert order
  insert into "Order" (
    "orderNumber", "spaceId", "customerName", "customerPhone", status,
    "totalAmount", subtotal, tax, discount, notes, "createdBy",
    "createdAt", "updatedAt"
  ) values (
    v_order_number, p_space_id, p_customer_name, p_customer_phone, 'PENDIENTE',
    coalesce(p_total_amount, 0), coalesce(p_subtotal, 0), coalesce(p_tax, 0), coalesce(p_discount, 0), p_notes, p_created_by,
    now(), now()
  ) returning id into v_order_id;

  -- Insert items
  if p_items is not null and jsonb_array_length(p_items) > 0 then
    insert into "OrderItem" (
      "orderId", "productId", "comboId", name, "unitPrice", "totalPrice", quantity, status, notes, "createdAt"
    )
    select
      v_order_id,
      case when coalesce(item->>'productId','') <> '' then (item->>'productId')::uuid else null end,
      case when coalesce(item->>'comboId','') <> '' then (item->>'comboId')::uuid else null end,
      item->>'name',
      coalesce((item->>'unitPrice')::numeric, 0),
      coalesce((item->>'totalPrice')::numeric, 0),
      coalesce((item->>'quantity')::int, 1),
      'PENDIENTE',
      item->>'notes',
      now()
    from jsonb_array_elements(p_items) as item;
  end if;

  -- Mark space as occupied
  update "Space" set status = 'OCUPADA', "updatedAt" = now() where id = p_space_id;

  return query select v_order_id, v_order_number;
end;
$$;

-- Grant permissions
revoke all on function create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb) from public;
grant execute on function create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb) to anon, authenticated;

-- Test the function
select 'Function created successfully' as status;












