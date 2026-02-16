// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    Boolean: boolean,
    DateTime: string,
    Decimal: string,
    HTML: string,
    ID: string,
    Int: number,
    String: string,
    URL: string,
}

export interface Collection {
    description: Scalars['String']
    handle: Scalars['String']
    id: Scalars['ID']
    image: (Image | null)
    title: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'Collection'
}

export interface CollectionConnection {
    edges: CollectionEdge[]
    pageInfo: PageInfo
    __typename: 'CollectionConnection'
}

export interface CollectionEdge {
    cursor: Scalars['String']
    node: Collection
    __typename: 'CollectionEdge'
}

export type CurrencyCode = 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'USD'

export interface Image {
    altText: (Scalars['String'] | null)
    height: (Scalars['Int'] | null)
    url: Scalars['URL']
    width: (Scalars['Int'] | null)
    __typename: 'Image'
}

export interface MoneyV2 {
    amount: Scalars['Decimal']
    currencyCode: CurrencyCode
    __typename: 'MoneyV2'
}

export interface PageInfo {
    endCursor: (Scalars['String'] | null)
    hasNextPage: Scalars['Boolean']
    __typename: 'PageInfo'
}

export interface Product {
    collections: CollectionConnection
    description: Scalars['String']
    descriptionHtml: Scalars['HTML']
    featuredImage: (Image | null)
    handle: Scalars['String']
    id: Scalars['ID']
    options: ProductOption[]
    productType: Scalars['String']
    publishedAt: (Scalars['DateTime'] | null)
    status: ProductStatus
    tags: Scalars['String'][]
    title: Scalars['String']
    updatedAt: Scalars['DateTime']
    variants: ProductVariantConnection
    vendor: Scalars['String']
    __typename: 'Product'
}

export interface ProductConnection {
    edges: ProductEdge[]
    pageInfo: PageInfo
    __typename: 'ProductConnection'
}

export interface ProductEdge {
    cursor: Scalars['String']
    node: Product
    __typename: 'ProductEdge'
}

export interface ProductOption {
    name: Scalars['String']
    values: Scalars['String'][]
    __typename: 'ProductOption'
}

export type ProductStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT'

export interface ProductVariant {
    availableForSale: Scalars['Boolean']
    compareAtPrice: (MoneyV2 | null)
    id: Scalars['ID']
    inventoryPolicy: (ProductVariantInventoryPolicy | null)
    price: MoneyV2
    selectedOptions: SelectedOption[]
    sku: (Scalars['String'] | null)
    title: Scalars['String']
    updatedAt: Scalars['DateTime']
    __typename: 'ProductVariant'
}

export interface ProductVariantConnection {
    edges: ProductVariantEdge[]
    pageInfo: PageInfo
    __typename: 'ProductVariantConnection'
}

export interface ProductVariantEdge {
    cursor: Scalars['String']
    node: ProductVariant
    __typename: 'ProductVariantEdge'
}

export type ProductVariantInventoryPolicy = 'CONTINUE' | 'DENY'

export interface Query {
    collections: CollectionConnection
    product: (Product | null)
    products: ProductConnection
    __typename: 'Query'
}

export interface SelectedOption {
    name: Scalars['String']
    value: Scalars['String']
    __typename: 'SelectedOption'
}

export interface CollectionGenqlSelection{
    description?: boolean | number
    handle?: boolean | number
    id?: boolean | number
    image?: ImageGenqlSelection
    title?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CollectionConnectionGenqlSelection{
    edges?: CollectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CollectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: CollectionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImageGenqlSelection{
    altText?: boolean | number
    height?: boolean | number
    url?: boolean | number
    width?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MoneyV2GenqlSelection{
    amount?: boolean | number
    currencyCode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageInfoGenqlSelection{
    endCursor?: boolean | number
    hasNextPage?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ProductGenqlSelection{
    collections?: (CollectionConnectionGenqlSelection & { __args: {first: Scalars['Int']} })
    description?: boolean | number
    descriptionHtml?: boolean | number
    featuredImage?: ImageGenqlSelection
    handle?: boolean | number
    id?: boolean | number
    options?: ProductOptionGenqlSelection
    productType?: boolean | number
    publishedAt?: boolean | number
    status?: boolean | number
    tags?: boolean | number
    title?: boolean | number
    updatedAt?: boolean | number
    variants?: (ProductVariantConnectionGenqlSelection & { __args: {first: Scalars['Int']} })
    vendor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ProductConnectionGenqlSelection{
    edges?: ProductEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ProductEdgeGenqlSelection{
    cursor?: boolean | number
    node?: ProductGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ProductOptionGenqlSelection{
    name?: boolean | number
    values?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ProductVariantGenqlSelection{
    availableForSale?: boolean | number
    compareAtPrice?: MoneyV2GenqlSelection
    id?: boolean | number
    inventoryPolicy?: boolean | number
    price?: MoneyV2GenqlSelection
    selectedOptions?: SelectedOptionGenqlSelection
    sku?: boolean | number
    title?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ProductVariantConnectionGenqlSelection{
    edges?: ProductVariantEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ProductVariantEdgeGenqlSelection{
    cursor?: boolean | number
    node?: ProductVariantGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    collections?: (CollectionConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), first: Scalars['Int'], query?: (Scalars['String'] | null)} })
    product?: (ProductGenqlSelection & { __args: {id: Scalars['ID']} })
    products?: (ProductConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), first: Scalars['Int'], query?: (Scalars['String'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SelectedOptionGenqlSelection{
    name?: boolean | number
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Collection_possibleTypes: string[] = ['Collection']
    export const isCollection = (obj?: { __typename?: any } | null): obj is Collection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCollection"')
      return Collection_possibleTypes.includes(obj.__typename)
    }
    


    const CollectionConnection_possibleTypes: string[] = ['CollectionConnection']
    export const isCollectionConnection = (obj?: { __typename?: any } | null): obj is CollectionConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCollectionConnection"')
      return CollectionConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CollectionEdge_possibleTypes: string[] = ['CollectionEdge']
    export const isCollectionEdge = (obj?: { __typename?: any } | null): obj is CollectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCollectionEdge"')
      return CollectionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Image_possibleTypes: string[] = ['Image']
    export const isImage = (obj?: { __typename?: any } | null): obj is Image => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImage"')
      return Image_possibleTypes.includes(obj.__typename)
    }
    


    const MoneyV2_possibleTypes: string[] = ['MoneyV2']
    export const isMoneyV2 = (obj?: { __typename?: any } | null): obj is MoneyV2 => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMoneyV2"')
      return MoneyV2_possibleTypes.includes(obj.__typename)
    }
    


    const PageInfo_possibleTypes: string[] = ['PageInfo']
    export const isPageInfo = (obj?: { __typename?: any } | null): obj is PageInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageInfo"')
      return PageInfo_possibleTypes.includes(obj.__typename)
    }
    


    const Product_possibleTypes: string[] = ['Product']
    export const isProduct = (obj?: { __typename?: any } | null): obj is Product => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProduct"')
      return Product_possibleTypes.includes(obj.__typename)
    }
    


    const ProductConnection_possibleTypes: string[] = ['ProductConnection']
    export const isProductConnection = (obj?: { __typename?: any } | null): obj is ProductConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductConnection"')
      return ProductConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ProductEdge_possibleTypes: string[] = ['ProductEdge']
    export const isProductEdge = (obj?: { __typename?: any } | null): obj is ProductEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductEdge"')
      return ProductEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ProductOption_possibleTypes: string[] = ['ProductOption']
    export const isProductOption = (obj?: { __typename?: any } | null): obj is ProductOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductOption"')
      return ProductOption_possibleTypes.includes(obj.__typename)
    }
    


    const ProductVariant_possibleTypes: string[] = ['ProductVariant']
    export const isProductVariant = (obj?: { __typename?: any } | null): obj is ProductVariant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductVariant"')
      return ProductVariant_possibleTypes.includes(obj.__typename)
    }
    


    const ProductVariantConnection_possibleTypes: string[] = ['ProductVariantConnection']
    export const isProductVariantConnection = (obj?: { __typename?: any } | null): obj is ProductVariantConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductVariantConnection"')
      return ProductVariantConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ProductVariantEdge_possibleTypes: string[] = ['ProductVariantEdge']
    export const isProductVariantEdge = (obj?: { __typename?: any } | null): obj is ProductVariantEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductVariantEdge"')
      return ProductVariantEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const SelectedOption_possibleTypes: string[] = ['SelectedOption']
    export const isSelectedOption = (obj?: { __typename?: any } | null): obj is SelectedOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSelectedOption"')
      return SelectedOption_possibleTypes.includes(obj.__typename)
    }
    

export const enumCurrencyCode = {
   CAD: 'CAD' as const,
   EUR: 'EUR' as const,
   GBP: 'GBP' as const,
   JPY: 'JPY' as const,
   USD: 'USD' as const
}

export const enumProductStatus = {
   ACTIVE: 'ACTIVE' as const,
   ARCHIVED: 'ARCHIVED' as const,
   DRAFT: 'DRAFT' as const
}

export const enumProductVariantInventoryPolicy = {
   CONTINUE: 'CONTINUE' as const,
   DENY: 'DENY' as const
}
