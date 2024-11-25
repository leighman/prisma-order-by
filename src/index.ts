import { Effect } from 'effect'
import { Prisma, PrismaClient } from '@prisma/client'

type Client = ReturnType<typeof initPrisma>

const initPrisma = () => {
  const prisma = new PrismaClient()

  return prisma.$extends({
    model: {
      $allModels: {
        findManyEffect<T, A extends Prisma.Args<T, 'findMany'>>(
          this: T,
          args: A
        ): Effect.Effect<Prisma.Result<T, A, 'findMany'>> {
          const context = Prisma.getExtensionContext(this)

          return Effect.promise(() => (context as any).findMany(args))
        },
      },
    },
  })
}

const fromDbWorkflow = (
  x: Prisma.WorkflowGetPayload<{
    include: { tasks: true }
  }>
) => {
  return 1 as any
}

const run = (prisma: Client) => {
  return prisma.workflow
    .findManyEffect({
      orderBy: {
        createdTimestamp: 'desc',
      },
      include: { tasks: true },
    })
    .pipe(Effect.map((workflows) => workflows.map(fromDbWorkflow)))
}

run(initPrisma())
