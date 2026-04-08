export const USERS = {
    standard: {
        username: 'standard_user',
        password: 'secret_sauce',
    },
    locked: {
        username: 'locked_out_user',
        password: 'secret_sauce',
    },
    invalid: {
        username: 'invalid_user',
        password: 'wrong_password',
    },
} as const;

export const MESSAGES = {
    lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
    invalidCreds: 'Epic sadface: Username and password do not match any user in this service',
    usernameRequired: 'Epic sadface: Username is required',
    passwordRequired: 'Epic sadface: Password is required',
} as const;

export const URLS = {
    login: '/',
    inventory: '/inventory.html',
    cart: '/cart.html',
    checkout: '/checkout-step-one.html',
} as const;