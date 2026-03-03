import type {
  GetPredictiveSearchQuery,
  SearchProductsQuery,
} from "@acme/shopify/storefront/generated";

export type SearchResultProductNode = Extract<
  SearchProductsQuery["search"]["nodes"][number],
  { __typename: "Product" }
>;

export type SearchResultPageInfo = SearchProductsQuery["search"]["pageInfo"];

export type SearchResultFilter =
  SearchProductsQuery["search"]["productFilters"][number];

export type PredictiveSearchResult = NonNullable<
  GetPredictiveSearchQuery["predictiveSearch"]
>;

export type PredictiveSearchProduct =
  PredictiveSearchResult["products"][number];

export type PredictiveSearchSuggestion =
  PredictiveSearchResult["queries"][number];
