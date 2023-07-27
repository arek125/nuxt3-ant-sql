
export default defineNuxtRouteMiddleware((to, from) => {
    // const authState = useAuthState();
    // if (to.path != "/login" && !authState.value.loggedIn) 
    //     return navigateTo('/login')
    // else if (to.path == "/login" && authState.value.loggedIn)
    //     return navigateTo('/')
    const { status } = useSession()
    // Return immeadiatly if user is already authenticated
    if (to.path != "/login" && status.value !== 'authenticated' ) {
        return navigateTo('/login')
    }
    else if (to.path == "/login" && status.value === 'authenticated')
        return navigateTo('/')
})