<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
//import Schema from 'async-validator'
//const authState = useAuthState()
const { data: authState}: { data: any } = useSession()
const alert = useAlert();
const props = defineProps({
  userData: {
    type: [Object],
    default: {id: null, name: '',email: '', active: true, roles:[], type: 'credentials' }
  }
})

const formRef:any = ref<FormInstance>();
// const newPassword = ref('')
// const newPasswordCheck = ref('')
// const currentPassoword = ref('')
const passwords = reactive({
    current: '',
    new: '',
    check:''
})

const roles_ = await $fetch('/api/roles')

const user = reactive(props.userData)
//const router = useRouter()
function changeProfileData(){
    if(!user.id){//newuser
        $fetch('/api/users', {
            method: 'POST',
            body: { ...user, newPassword: passwords.new },
        })
        .then((response: any) => {
            navigateTo('/users/user-'+response.id)
        })
        .catch((e) => {
            alert.set('error',e)
            console.error(e);
        });
    }else{
        $fetch('/api/users/'+user.id, {
            method: 'POST',
            body: { ...user, currentPassoword: passwords.current, newPassword: passwords.new },
        })
        .then((response: any) => {
            alert.set('success','User updated')
            passwords.check = ''
            passwords.new = ''
            passwords.current = ''
        })
        .catch((e) => {
            alert.set('error',e)
            console.error(e);
        });
    }
}
    // function passCheck () {
    //     if(newPasswordCheck.value == newPassword.value)
    //         return Promise.resolve()
    //     else return Promise.reject()
    // }

    let validatePass = async (_rule: Rule, value: string) => {
      if (passwords.new === '' && !user.id) {
        return Promise.reject('Please input the password');
      } else {
        if (passwords.check !== '') {
          formRef.value.validateFields('newPasswordCheck');
        }
        return Promise.resolve();
      }
    };
    let validatePass2 = async (_rule: Rule, value: string) => {
       if (passwords.check != passwords.new) {
        return Promise.reject("Two inputs don't match!");
      } else {
        return Promise.resolve();
      }
    };

    const rules: Record<string, Rule[]> = {
        name: [{ required: true, message: 'Please input user name !'}],
        email: [{ required: true, pattern: /.+@.+\..+/, message: 'Please input user corect email !' }],
        currentPassword: [{ required: true, message: 'Please input your current password !'}],
        newPassword: [{ min: 6, required: user.id?false:true, validator: validatePass, trigger: 'change' }],
        newPasswordCheck: [{ validator: validatePass2, trigger: 'change' }],
    };

    const adminMode = ref(authState.value.user.roles.includes('Admin'))


</script>

<template>
<div>
<a-card :title="user.id?'User: '+user.id:'New User'">
    <a-form
        ref="formRef"
        :model="user"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        :rules="rules"
        @finish="changeProfileData"
        :disabled="authState.user.id != user.id && !adminMode"
    >
        <a-form-item
        label="Name"
        name="name"
        
        >
            <a-input v-model:value="user.name" />
        </a-form-item>

        <a-form-item
        label="Email"
        name="email"
        >
            <a-input v-model:value="user.email" :disabled="user.type != 'credentials'"/>
        </a-form-item>

        <a-form-item
        label="Type"
        name="type"
        >
            {{ user.type }}
        </a-form-item>

                <a-form-item
        label="Roles"
        name="roles"
        >
            <a-checkbox-group v-model:value="user.roles" style="width: 100%" :disabled="!adminMode">
                <a-row>
                    <a-col :span="4" v-for="role in roles_">
                        <a-checkbox :value="role.id">{{role.name}}</a-checkbox>
                    </a-col>
                </a-row>
            </a-checkbox-group>
        </a-form-item>

        <a-form-item name="active"
        label="Status"
        >
            <a-checkbox v-model:checked="user.active" :disabled="!adminMode">Active</a-checkbox>
        </a-form-item>

        <a-form-item v-if="authState.user.id == user.id && passwords.new && user.type == 'credentials'"
        label="Current password"
        name="currentPassword"
        >
            <a-input-password v-model:value="passwords.current" />
        </a-form-item>

        <a-form-item v-if="(authState.user.id == user.id || adminMode) && user.type == 'credentials'"
        label="New password"
        name="newPassword"
        has-feedback
        >
            <!-- <a-input-password v-model:value="newPassword" /> -->
            <a-input v-model:value="passwords.new" type="password" autocomplete="off" />
        </a-form-item>

        <a-form-item v-if="(authState.user.id == user.id || adminMode) && user.type == 'credentials'"
        label="Repeat new password"
        name="newPasswordCheck"
        has-feedback
        >
            <!-- <a-input-password v-model:value="newPasswordCheck" /> -->
            <a-input v-model:value="passwords.check" type="password" autocomplete="off" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
            <a-button :disabled="authState.user.id != user.id && !adminMode" type="primary" html-type="submit">Submit</a-button>
        </a-form-item>
    </a-form>
</a-card>
</div>
</template>