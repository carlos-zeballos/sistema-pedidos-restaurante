const fs = require('fs');
const path = require('path');

async function updatePaymentsService() {
  console.log('🔧 Actualizando PaymentsService para usar función RPC...\n');

  try {
    const paymentsServicePath = path.join(__dirname, 'src', 'payments', 'payments.service.ts');
    
    // Leer el archivo actual
    let content = fs.readFileSync(paymentsServicePath, 'utf8');
    
    // Reemplazar el método registerPayment para usar la función RPC
    const newRegisterPaymentMethod = `  // Registrar un pago usando función RPC
  async registerPayment(paymentRequest: PaymentRequest, waiterId?: string): Promise<OrderPayment> {
    try {
      console.log('💰 Registrando pago via RPC:', paymentRequest);
      
      // Usar función RPC para registrar el pago
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('register_payment', {
          p_order_id: paymentRequest.orderId,
          p_payment_method_id: paymentRequest.paymentMethodId,
          p_amount: paymentRequest.amount,
          p_is_delivery_service: false,
          p_notes: paymentRequest.notes || null
        });

      if (error) {
        console.error('❌ Error en función RPC register_payment:', error);
        throw new Error(`Error registrando pago: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No se recibió respuesta de la función RPC');
      }

      const result = data[0];
      if (!result.success) {
        throw new Error(result.message || 'Error desconocido al registrar pago');
      }

      console.log('✅ Pago registrado exitosamente via RPC:', result);

      // Obtener el pago registrado para devolverlo
      const { data: paymentData, error: fetchError } = await this.supabaseService
        .getClient()
        .from('OrderPayment')
        .select(`
          *,
          PaymentMethod (
            name,
            icon,
            color
          )
        `)
        .eq('id', result.payment_id)
        .single();

      if (fetchError) {
        console.error('❌ Error obteniendo pago registrado:', fetchError);
        throw new Error('Error obteniendo pago registrado');
      }

      return paymentData;
    } catch (error) {
      console.error('Error registering payment:', error);
      throw new Error('Error al registrar el pago');
    }
  }`;

    // Reemplazar el método registerPayment existente
    const registerPaymentRegex = /\/\/ Registrar un pago[\s\S]*?return data;\s*}\s*catch \(error\) {[\s\S]*?throw new Error\('Error al registrar el pago'\);\s*}\s*}/;
    
    if (registerPaymentRegex.test(content)) {
      content = content.replace(registerPaymentRegex, newRegisterPaymentMethod);
      console.log('✅ Método registerPayment actualizado para usar función RPC');
    } else {
      console.log('⚠️ No se encontró el método registerPayment para reemplazar');
    }

    // Escribir el archivo actualizado
    fs.writeFileSync(paymentsServicePath, content, 'utf8');
    console.log('✅ PaymentsService actualizado exitosamente');

    // Verificar que el archivo se escribió correctamente
    const updatedContent = fs.readFileSync(paymentsServicePath, 'utf8');
    if (updatedContent.includes('register_payment')) {
      console.log('✅ Verificación: función RPC register_payment encontrada en el código');
    } else {
      console.log('❌ Verificación: función RPC register_payment NO encontrada');
    }

    console.log('\n🎉 ¡PaymentsService actualizado exitosamente!');
    console.log('✅ Método registerPayment ahora usa función RPC');
    console.log('✅ Sistema listo para registrar pagos correctamente');

  } catch (error) {
    console.error('❌ Error actualizando PaymentsService:', error.message);
  }
}

updatePaymentsService();

