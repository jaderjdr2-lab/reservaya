import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

async function main() {
  const now = new Date()
  const tenants = [
    { name: 'Barbería Demo', subdomain: 'barberia-demo', slug: 'barberia-demo', whatsapp: '3001112233' },
    { name: 'Spa Demo', subdomain: 'spa-demo', slug: 'spa-demo', whatsapp: '3004445566' },
  ]

  for (const item of tenants) {
    await prisma.tenant.upsert({
      where: { subdomain: item.subdomain },
      update: {},
      create: {
        name: item.name,
        subdomain: item.subdomain,
        slug: item.slug,
        whatsapp: item.whatsapp,
        description: 'Negocio de demostración para RESERVAYA',
        city: 'Barrancabermeja',
        subscription: {
          create: {
            status: 'TRIAL',
            monthlyPriceCents: 15000000,
            currentPeriodStart: now,
            currentPeriodEnd: addMonths(now, 1),
          },
        },
        businessHours: {
          create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
            dayOfWeek,
            openTime: dayOfWeek === 0 ? '00:00' : '08:00',
            closeTime: dayOfWeek === 0 ? '00:00' : '18:00',
            isClosed: dayOfWeek === 0,
          })),
        },
        services: {
          create: [
            {
              name: 'Servicio principal',
              description: 'Servicio demo',
              durationMinutes: 60,
              priceCents: 5000000,
            },
          ],
        },
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
