-- Script para recrear los RPCs con los parámetros correctos

-- Eliminar RPCs existentes si existen
DROP FUNCTION IF EXISTS category_upsert(text, integer, text, text, boolean, uuid);
DROP FUNCTION IF EXISTS product_upsert(text, text, uuid, numeric, product_type, text, text, integer, boolean, boolean, text[], jsonb, uuid);
DROP FUNCTION IF EXISTS space_upsert(text, text, space_type, integer, table_status, boolean, text, uuid);

-- Crear RPC category_upsert
CREATE OR REPLACE FUNCTION category_upsert(
    p_name text,
    p_ord integer,
    p_description text DEFAULT NULL,
    p_image text DEFAULT NULL,
    p_is_active boolean DEFAULT TRUE,
    p_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    result_id uuid;
BEGIN
    -- Si p_id es NULL, es una inserción
    IF p_id IS NULL THEN
        INSERT INTO "Category" (name, ord, description, image, "isActive")
        VALUES (p_name, p_ord, p_description, p_image, p_is_active)
        RETURNING id INTO result_id;
    ELSE
        -- Es una actualización
        UPDATE "Category" 
        SET 
            name = p_name,
            ord = p_ord,
            description = p_description,
            image = p_image,
            "isActive" = p_is_active,
            "updatedAt" = NOW()
        WHERE id = p_id
        RETURNING id INTO result_id;
    END IF;
    
    RETURN result_id;
END;
$$;

-- Crear RPC product_upsert
CREATE OR REPLACE FUNCTION product_upsert(
    p_code text,
    p_name text,
    p_category_id uuid,
    p_price numeric(10,2),
    p_type product_type DEFAULT 'COMIDA',
    p_description text DEFAULT NULL,
    p_image text DEFAULT NULL,
    p_preparation_time integer DEFAULT 15,
    p_is_enabled boolean DEFAULT TRUE,
    p_is_available boolean DEFAULT TRUE,
    p_allergens text[] DEFAULT NULL,
    p_nutritional_info jsonb DEFAULT NULL,
    p_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    result_id uuid;
BEGIN
    -- Si p_id es NULL, es una inserción
    IF p_id IS NULL THEN
        INSERT INTO "Product" (code, name, "categoryId", price, type, description, image, "preparationTime", "isEnabled", "isAvailable", allergens, "nutritionalInfo")
        VALUES (p_code, p_name, p_category_id, p_price, p_type, p_description, p_image, p_preparation_time, p_is_enabled, p_is_available, p_allergens, p_nutritional_info)
        RETURNING id INTO result_id;
    ELSE
        -- Es una actualización
        UPDATE "Product" 
        SET 
            code = p_code,
            name = p_name,
            "categoryId" = p_category_id,
            price = p_price,
            type = p_type,
            description = p_description,
            image = p_image,
            "preparationTime" = p_preparation_time,
            "isEnabled" = p_is_enabled,
            "isAvailable" = p_is_available,
            allergens = p_allergens,
            "nutritionalInfo" = p_nutritional_info,
            "updatedAt" = NOW()
        WHERE id = p_id
        RETURNING id INTO result_id;
    END IF;
    
    RETURN result_id;
END;
$$;

-- Crear RPC space_upsert
CREATE OR REPLACE FUNCTION space_upsert(
    p_code text,
    p_name text,
    p_type space_type,
    p_capacity integer DEFAULT 4,
    p_status table_status DEFAULT 'LIBRE',
    p_is_active boolean DEFAULT TRUE,
    p_notes text DEFAULT NULL,
    p_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    result_id uuid;
BEGIN
    -- Si p_id es NULL, es una inserción
    IF p_id IS NULL THEN
        INSERT INTO "Space" (code, name, type, capacity, status, "isActive", notes)
        VALUES (p_code, p_name, p_type, p_capacity, p_status, p_is_active, p_notes)
        RETURNING id INTO result_id;
    ELSE
        -- Es una actualización
        UPDATE "Space" 
        SET 
            code = p_code,
            name = p_name,
            type = p_type,
            capacity = p_capacity,
            status = p_status,
            "isActive" = p_is_active,
            notes = p_notes,
            "updatedAt" = NOW()
        WHERE id = p_id
        RETURNING id INTO result_id;
    END IF;
    
    RETURN result_id;
END;
$$;

-- Recargar el esquema de PostgREST
NOTIFY pgrst, 'reload schema';

-- Verificar que los RPCs se crearon correctamente
SELECT 
    routine_name, 
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('category_upsert', 'product_upsert', 'space_upsert')
ORDER BY routine_name;












