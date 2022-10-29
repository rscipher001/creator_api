import Stripe from 'stripe'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import { Price } from 'App/Interfaces/Enums'
import ProjectInput from 'App/Interfaces/ProjectInput'

class StripeService {
  protected stripe: Stripe

  constructor() {
    this.stripe = new Stripe(Env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2022-08-01',
    })
  }

  public async createCustomer(user: User) {
    return this.stripe.customers.create({
      email: user.email,
      name: user.name,
      address: {
        line1: 'Bhopal',
        state: 'MP',
        country: 'IN',
      },
      metadata: {
        id: user.id,
      },
    })
  }

  public async createPaymentIntent(user: User, projectInput: ProjectInput) {
    let amount = 0
    if (projectInput.generate.api.generate) {
      amount += Price.api
    }
    if (projectInput.generate.spa.generate) {
      amount += Price.spa
    }

    return this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'INR',
      description: 'Payment for service',
      customer: await user.getOrCreateStripeId(),
    })
  }
}

export default new StripeService()
