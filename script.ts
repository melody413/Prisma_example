import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/*  Part I
	Input: array of Users
	Output: array of email addresses (i.e. array of strings)
 */
function validateWalletItems(users: any): string[] {
	const validation: string[] = []; 
	for(const user of users) {
		let balance = 0;
		for(const item of user.userWalletItem) {
			if(item.type === "credit") {
				balance += item.amount;
			} else if(item.type === "debit") {
				balance -= item.amount;
			}
		}
		if(balance !== user.userWallet.walletBalance) {
			validation.push(user.email)
		}
	}
	return validation;
}

/*  Part II
	Input: array of Users
	Output: total admin cash given out in dollars (i.e. number)
 */
function calculateAdminCash(users: any): number {
	let totalAmount: number = 0;
	for(const user of users) {
		for(const item of user.userWalletItem) {
			if(item.type === "credit" && item.description === "adminCash") {
				totalAmount += item.amount;
			}
		}
	}
	return totalAmount / 100;
}

/*  Part III
	Complete the query that is used here:
	await prisma.user.findMany(query1);
 */
const query1 = {
	where: {
		active: true,
		createdAt: {
			gte: new Date('2022-12-01T00:00:00.000Z'),
			lt: new Date('2023-01-01T00:00:00.000Z')
		},
		OR: [
			{
				classification: {
					contains: 'logistics',
				}
			}			
		],
	},
	select: {
		id: true,
		email: true,
		ownerName: true,
		businessName: true,
		classification: true,
		active: true,
		createdAt: true,
		userWallet: true 
	},
};

/*  Part IV
	Complete the query that is used here:
	await prisma.user.update(query2);
 */
const query2 = {
	where: {
		email: 'alex@movingcompany.com',
	},
	data: {
		userWallet: {
			update: {
			walletBalance: {
				decrement: 1280,
			},
			},
		},
		userWalletItem: {
			create: {
				type: 'debit',
				amount: 1280,
				description: '',
			},
		},
	},
}

/***********************************
 * DO NOT MODIFY ANY CODE BELOW HERE
 ***********************************/
const user1 = {
    data: {
		businessName: 'ABC Logistics',
		email: 'rishi@ABC.com',
		ownerName: 'rishi jain',
		classification: 'logistics company',
		active: false,
		userWallet: {
			create: {
				walletBalance: 2000, //stored in cents
			}
		},
		userWalletItem: 
		{
			create: [
				{
				type: 'credit',
				amount: 2000,
				description: 'adminCash',
				}
			]
		},
    },
};

const user2 = {
    data: {
		businessName: 'Moving Company',
		email: 'alex@movingcompany.com',
		ownerName: 'Alex Kroney',
		classification: 'last mile logistics',
		active: true,
		userWallet: {
			create: {
				walletBalance: 2500,
			}
		},
		userWalletItem: 
		{
			create: [
				{
				type: 'credit',
				amount: 2500, 
				description: 'adminCash',
				},
				{
				type: 'debit',
				amount: 2200, 
				description: '', //when type = 'debit', description is empty
				},
				{
				type: 'credit',
				amount: 2200, 
				description: 'cash', 
				}
			]
		},
    },
};

async function main() {
	/* The following was originally used to create the 2 users
	await prisma.user.create(user1);
	await prisma.user.create(user2);
	*/
	const users = await prisma.user.findMany({
		include: {
      		userWallet: true,
      		userWalletItem: true,
    	},
	})
	
	console.log('*** Users', users);
	
	validateWalletItems(users);
	calculateAdminCash(users);
	const queried = await prisma.user.findMany(query1);
	console.log(queried);
	// const updated = await prisma.user.update(query2);
	// console.log(updated);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
