import { expect, test } from '@playwright/test';


test('register account',async({request},testInfo)=>{
   
     for(let i=0;i<testInfo.config.workers;i++){
        let newUser = {
            name: 'bidapitestuser',
            email: `bidapitest${i}@test.com`,
            password: 'password123',
         };

          const response = await request.post('http://localhost:4000/auth/register', {
               data: newUser,
            });
          if(response.status() == 201){
            console.log(newUser.email);
            console.log('account created');
          }else if(response.status() == 409){
            console.log(newUser.email);
            console.log('existing account');
          }else{
            console.log('error');
            expect(response.status()).toEqual(200);
          }

     }
      
});