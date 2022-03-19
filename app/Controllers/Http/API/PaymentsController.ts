import Project from 'App/Models/Project'
import StripeService from 'App/Services/StripeService'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PaymentsController {
  public async prepareStripePayment({ request, auth }: HttpContextContract) {
    const project = await Project.query()
      .where({
        userId: auth.user!.id,
        id: request.param('id'),
      })
      .firstOrFail()
    const projectInput = await project.projectInput
    const paymentIntent = await StripeService.createPaymentIntent(auth.user!, projectInput)
    return paymentIntent
  }

  public async stripeWebhook({ request, logger }: HttpContextContract) {
    logger.info(JSON.stringify(request.all()), null, 2)
    return 'ok'
  }
}
