import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const LEGACY_PRICE_CENTS = 4_000_000
const CURRENT_PRICE_CENTS = 15_000_000

async function main() {
  const legacy = await prisma.subscription.updateMany({
    where: { monthlyPriceCents: LEGACY_PRICE_CENTS },
    data: { monthlyPriceCents: CURRENT_PRICE_CENTS },
  })

  console.log(`Suscripciones migradas a $150.000 COP: ${legacy.count}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
