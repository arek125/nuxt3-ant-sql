<script lang="ts" setup>
    const authState = useAuthState();
    const router = useRouter();
    //const { setAlert } = useAlert()
    if (authState.value.loggedIn) {
    router.push('/');
    }
    interface FormState {
        email: string;
        password: string;
    }
    const formState = reactive<FormState>({
      email: '',
      password: '',
    });
    function attemptLogin()
    {
        $fetch('/api/user/login', {
            method: 'POST',
            body: { email: formState.email, password: formState.password },
        })
        .then(response => {
            authState.set({
            loggedIn: true,
            jwt: (response as { token: string }).token,
            user: { id: response.id, name: response.name, email: response.email, roles: response.roles },
            });
            router.push('/');
        })
        .catch((e) => {
            //setAlert('error','Login failed !')
            formState.password = ''
            console.error(e);
        });
    }
</script>

<template>
    <a-card title="Login">
        <Alert></Alert>
        <a-form
            :model="formState"
            name="basic"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 16 }"
            autocomplete="off"
            @finish="attemptLogin"
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