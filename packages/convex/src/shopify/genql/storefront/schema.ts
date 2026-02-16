// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    Boolean: boolean,
    Decimal: string,
    ID: string,
    Int: number,
    String: string,
    URL: string,
}

export interface Cart {
    checkoutUrl: Scalars['URL']
    id: Scalars['ID']
    lines: CartLineConnection
    __typename: 'Cart'
}

export interface CartCreatePayload {
    cart: (Cart | null)
    userErrors: CartUserError[]
    warnings: CartWarning[]
    __typename: 'CartCreatePayload'
}

export interface CartLine {
    cost: CartLineCost
    id: Scalars['ID']
    quantity: Scalars['Int']
    __typename: 'CartLine'
}

export interface CartLineConnection {
    edges: CartLineEdge[]
    __typename: 'CartLineConnection'
}

export interface CartLineCost {
    amountPerQuantity: MoneyV2
    __typename: 'CartLineCost'
}

export interface CartLineEdge {
    cursor: Scalars['String']
    node: CartLine
    __typename: 'CartLineEdge'
}

export interface CartLinesAddPayload {
    cart: (Cart | null)
    userErrors: CartUserError[]
    warnings: CartWarning[]
    __typename: 'CartLinesAddPayload'
}

export interface CartUserError {
    field: (Scalars['String'][] | null)
    message: Scalars['String']
    __typename: 'CartUserError'
}

export interface CartWarning {
    code: Scalars['String']
    message: Scalars['String']
    __typename: 'CartWarning'
}

export type CurrencyCode = 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'USD'

export interface MoneyV2 {
    amount: Scalars['Decimal']
    currencyCode: CurrencyCode
    __typename: 'MoneyV2'
}

export interface Mutation {
    cartCreate: CartCreatePayload
    cartLinesAdd: CartLinesAddPayload
    __typename: 'Mutation'
}

export interface Query {
    shopName: (Scalars['String'] | null)
    __typename: 'Query'
}

export interface CartGenqlSelection{
    checkoutUrl?: boolean | number
    id?: boolean | number
    lines?: (CartLineConnectionGenqlSelection & { __args: {first: Scalars['Int']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CartCreatePayloadGenqlSelection{
    cart?: CartGenqlSelection
    userErrors?: CartUserErrorGenqlSelection
    warnings?: CartWarningGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CartInput {lines?: (CartLineInput[] | null)}

export interface CartLineGenqlSelection{
    cost?: CartLineCostGenqlSelection
    id?: boolean | number
    quantity?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CartLineConnectionGenqlSelection{
    edges?: CartLineEdgeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CartLineCostGenqlSelection{
    amountPerQuantity?: MoneyV2GenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CartLineEdgeGenqlSelection{
    cursor?: boolean | number
    node?: CartLineGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CartLineInput {merchandiseId: Scalars['ID'],quantity: Scalars['Int']}

export interface CartLinesAddPayloadGenqlSelection{
    cart?: CartGenqlSelection
    userErrors?: CartUserErrorGenqlSelection
    warnings?: CartWarningGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CartUserErrorGenqlSelection{
    field?: boolean | number
    message?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CartWarningGenqlSelection{
    code?: boolean | number
    message?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MoneyV2GenqlSelection{
    amount?: boolean | number
    currencyCode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    cartCreate?: (CartCreatePayloadGenqlSelection & { __args?: {input?: (CartInput | null)} })
    cartLinesAdd?: (CartLinesAddPayloadGenqlSelection & { __args: {cartId: Scalars['ID'], lines: CartLineInput[]} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    shopName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Cart_possibleTypes: string[] = ['Cart']
    export const isCart = (obj?: { __typename?: any } | null): obj is Cart => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCart"')
      return Cart_possibleTypes.includes(obj.__typename)
    }
    


    const CartCreatePayload_possibleTypes: string[] = ['CartCreatePayload']
    export const isCartCreatePayload = (obj?: { __typename?: any } | null): obj is CartCreatePayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartCreatePayload"')
      return CartCreatePayload_possibleTypes.includes(obj.__typename)
    }
    


    const CartLine_possibleTypes: string[] = ['CartLine']
    export const isCartLine = (obj?: { __typename?: any } | null): obj is CartLine => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartLine"')
      return CartLine_possibleTypes.includes(obj.__typename)
    }
    


    const CartLineConnection_possibleTypes: string[] = ['CartLineConnection']
    export const isCartLineConnection = (obj?: { __typename?: any } | null): obj is CartLineConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartLineConnection"')
      return CartLineConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CartLineCost_possibleTypes: string[] = ['CartLineCost']
    export const isCartLineCost = (obj?: { __typename?: any } | null): obj is CartLineCost => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartLineCost"')
      return CartLineCost_possibleTypes.includes(obj.__typename)
    }
    


    const CartLineEdge_possibleTypes: string[] = ['CartLineEdge']
    export const isCartLineEdge = (obj?: { __typename?: any } | null): obj is CartLineEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartLineEdge"')
      return CartLineEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CartLinesAddPayload_possibleTypes: string[] = ['CartLinesAddPayload']
    export const isCartLinesAddPayload = (obj?: { __typename?: any } | null): obj is CartLinesAddPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartLinesAddPayload"')
      return CartLinesAddPayload_possibleTypes.includes(obj.__typename)
    }
    


    const CartUserError_possibleTypes: string[] = ['CartUserError']
    export const isCartUserError = (obj?: { __typename?: any } | null): obj is CartUserError => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartUserError"')
      return CartUserError_possibleTypes.includes(obj.__typename)
    }
    


    const CartWarning_possibleTypes: string[] = ['CartWarning']
    export const isCartWarning = (obj?: { __typename?: any } | null): obj is CartWarning => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartWarning"')
      return CartWarning_possibleTypes.includes(obj.__typename)
    }
    


    const MoneyV2_possibleTypes: string[] = ['MoneyV2']
    export const isMoneyV2 = (obj?: { __typename?: any } | null): obj is MoneyV2 => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMoneyV2"')
      return MoneyV2_possibleTypes.includes(obj.__typename)
    }
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    

export const enumCurrencyCode = {
   CAD: 'CAD' as const,
   EUR: 'EUR' as const,
   GBP: 'GBP' as const,
   JPY: 'JPY' as const,
   USD: 'USD' as const
}
