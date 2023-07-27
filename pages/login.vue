<script lang="ts" setup>
    definePageMeta({ auth: false })
    //const authState = useAuthState();
    //const router = useRouter();
    const alert = useAlert();
    interface FormState {
        email: string;
        password: string;
    }
    const formState = reactive<FormState>({
      email: '',
      password: '',
    });
    // function attemptLogin()
    // {
    //     $fetch('/api/user/login', {
    //         method: 'POST',
    //         body: { email: formState.email, password: formState.password },
    //     })
    //     .then(response => {
    //         authState.set({
    //             loggedIn: true,
    //             jwt: (response as { token: string }).token,
    //             user: { id: response.id, name: response.name, email: response.email, roles: response.roles },
    //         });
    //         router.push('/');
    //     })
    //     .catch((e) => {
    //         alert.set('error',e)
    //         formState.password = ''
    //         console.error(e);
    //     });
    // }
    const { signIn } = useSession()
    const mySignInHandler = async () => {
        const { error, url } = await signIn('credentials', { username: formState.email, password: formState.password, redirect: false })
        if (error) {
                alert.set('error','Wrong credentials !')
                formState.password = ''
        } else {
            //authState.set()
            navigateTo("/")
        }
    }
    const azure = async () =>{
        const { error, url } = await signIn('azure-ad')
        if (error) {
                alert.set('error','Wrong Azure credentials ?')
        } else {
            //authState.set()
            navigateTo("/")
        }
    }

</script>

<template>
    <a-card title="Login">
        <template #extra>
            <a-button type="primary" @click="azure">Login with Office 365
                <template #icon><mdi-account-sync /></template>
            </a-button>
        </template>
        <a-form
            :model="formState"
            name="basic"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 16 }"
            autocomplete="off"
            @finish="mySignInHandler"
        >
            <a-form-item
            label="Email"
            name="email"
            :rules="[{ required: true, message: 'Please input your email!' }]"
            >
                <a-input v-model:value="formState.email" />
            </a-form-item>

            <a-form-item
            label="Password"
            name="password"
            :rules="[{ required: true, message: 'Please input your password!' }]"
            >
                <a-input-password v-model:value="formState.password" />
            </a-form-item>

            <!-- <a-form-item name="remember" :wrapper-col="{ offset: 8, span: 16 }">
            <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
            </a-form-item> -->

            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                <a-button type="primary" html-type="submit">Submit</a-button>
            </a-form-item>
        </a-form>
    </a-card>
</template>