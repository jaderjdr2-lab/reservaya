import { PrismaClient } from '@prisma/client'
import { MONTHLY_PRICE_CENTS } from '../lib/constants.ts'

const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.subscription.updateMany({
    where: { monthlyPriceCents: { not: MONTHLY_PRICE_CENTS } },
    data: { monthlyPriceCents: MONTHLY_PRICE_CENTS },
  })

  console.log(
    `Suscripciones actualizadas a $${(MONTHLY_PRICE_CENTS / 100).toLocaleString('es-CO')} COP: ${updated.count}`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
