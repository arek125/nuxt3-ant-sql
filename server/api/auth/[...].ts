import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import AzureADProvider from "next-auth/providers/azure-ad";
import User from '~~/server/models/user'
import Role from '~~/server/models/role'
import bcrypt from "bcrypt"
const runtimeConfig = useRuntimeConfig()

export default NuxtAuthHandler({
    secret: runtimeConfig.JWT_SECRET,
    pages: {
        // Change the default behavior to use `/login` as the path for the sign-in page
        signIn: '/login'
    },
    providers: [AzureADProvider.default({
            clientId: '########################',
            clientSecret: '######################',
            tenantId: '##########################',
        }),
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        CredentialsProvider.default({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize (credentials: any) {
                console.log(credentials)
                const user:any = await User.findOne({where: {email: credentials.username, active: true, type: 'credentials'}, include: {
                    model: Role,
                    attributes:{
                        exclude: ['createdAt', 'updatedAt']
                    },
                }
                })
                if (!user || !await bcrypt.compare(credentials.password, user.password) /*!await argon2.verify(user.password, password)*/) {
                    console.error('Warning: Malicious login attempt registered, bad credentials provided')
                    throw createError({
                        statusCode: 403,
                        statusMessage: "Credentials not working",
                    });
                }
                else 
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        roles: user.roles.map((x:any)=>x.name),
                      };
            }
        })
    ],
    callbacks: {
        jwt: async ({token, user, account}) => {
          if (user && account && account.provider != 'azure-ad') {
            token.id = user ? user.id || '' : '';
            token.roles = user ? (user as any).roles || '' : '';
          }
          else if(user && account && account.provider == 'azure-ad'){
            let dbUser:any = await User.findOne({where: {email: user.email, active: true, type: 'azure-ad'}, include: {model: Role}})
            if(!dbUser){
                let newDbUser:any = await User.create({name:user.name, email:user.email, active: true, type: 'azure-ad' })
                const userRole = await Role.findOne({where: {name:'User'}})
                await newDbUser.addRole(userRole)
                dbUser = await User.findOne({where: {email: user.email, active: true, type: 'azure-ad'}, include: {model: Role}})
            }
            token.id = dbUser.id
            token.roles = dbUser.roles.map((x:any)=>x.name)
          }
          return token
        },
        // Callback whenever session is checked, see https://next-auth.js.org/configuration/callbacks#session-callback
        session: async ({session, token}) => {
          (session as any).user.roles = token.roles;
          (session as any).user.id = token.id;
          return Promise.resolve(session);
        },
    },
    
})
