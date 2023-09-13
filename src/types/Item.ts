import { arg, extendType, inputObjectType, nonNull, objectType, stringArg } from 'nexus';
import { Item } from 'nexus-prisma';

export const item = objectType({
  name: Item.$name,
  definition(t) {
    t.field(Item.id);
    t.field(Item.saberPart);
    t.field(Item.partName);
    t.field(Item.partDescription);
    t.field(Item.price);
  },
});

export const ItemArgs = inputObjectType({
  name: 'ItemArgs',
  definition: (t) => {
    t.string('partDescription');
    t.nonNull.string('partName');
    t.nonNull.string('saberPart');
    t.int('price');
  },
});
export const ItemQueries = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.field('getAllUserItemsById', {
      type: nonNull('Item'),

      resolve: async (source, args, context) => {
        return context.db.item.findMany({ where: { userId: { equals: context.user.id } } });
      },
    });
  },
});

export const ItemMutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createItem', {
      type: 'Item',
      args: {
        input: nonNull(arg({ type: 'ItemArgs' })),
      },
      resolve: async (source, args, context) => {
        return context.db.item.create({
          data: {
            partDescription: args.input.partDescription,
            partName: args.input.partName,
            saberPart: args.input.saberPart,
            price: args.input.price,
          },
        });
      },
    });
    t.field('updateItemUserIdById', {
      type: 'Item',
      args: {
        partname: nonNull(stringArg()),
        newUserId: nonNull(stringArg()),
      },
      resolve: async (source, args, context) => {
        const item = await context.db.item.findFirstOrThrow({ where: { partName: { equals: args.partname } } });

        // Update the user ID of the found item
        const updatedItem = await context.db.item.update({
          where: { id: item.id }, // Assuming 'id' is the unique identifier of the item
          data: { userId: args.newUserId },
        });

        return updatedItem;
      },
    });
  },
});
