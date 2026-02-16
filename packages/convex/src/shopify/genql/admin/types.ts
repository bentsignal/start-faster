export default {
    "scalars": [
        0,
        4,
        5,
        6,
        7,
        8,
        10,
        17,
        21,
        24,
        25
    ],
    "types": {
        "Boolean": {},
        "Collection": {
            "description": [
                24
            ],
            "handle": [
                24
            ],
            "id": [
                8
            ],
            "image": [
                9
            ],
            "title": [
                24
            ],
            "updatedAt": [
                5
            ],
            "__typename": [
                24
            ]
        },
        "CollectionConnection": {
            "edges": [
                3
            ],
            "pageInfo": [
                12
            ],
            "__typename": [
                24
            ]
        },
        "CollectionEdge": {
            "cursor": [
                24
            ],
            "node": [
                1
            ],
            "__typename": [
                24
            ]
        },
        "CurrencyCode": {},
        "DateTime": {},
        "Decimal": {},
        "HTML": {},
        "ID": {},
        "Image": {
            "altText": [
                24
            ],
            "height": [
                10
            ],
            "url": [
                25
            ],
            "width": [
                10
            ],
            "__typename": [
                24
            ]
        },
        "Int": {},
        "MoneyV2": {
            "amount": [
                6
            ],
            "currencyCode": [
                4
            ],
            "__typename": [
                24
            ]
        },
        "PageInfo": {
            "endCursor": [
                24
            ],
            "hasNextPage": [
                0
            ],
            "__typename": [
                24
            ]
        },
        "Product": {
            "collections": [
                2,
                {
                    "first": [
                        10,
                        "Int!"
                    ]
                }
            ],
            "description": [
                24
            ],
            "descriptionHtml": [
                7
            ],
            "featuredImage": [
                9
            ],
            "handle": [
                24
            ],
            "id": [
                8
            ],
            "options": [
                16
            ],
            "productType": [
                24
            ],
            "publishedAt": [
                5
            ],
            "status": [
                17
            ],
            "tags": [
                24
            ],
            "title": [
                24
            ],
            "updatedAt": [
                5
            ],
            "variants": [
                19,
                {
                    "first": [
                        10,
                        "Int!"
                    ]
                }
            ],
            "vendor": [
                24
            ],
            "__typename": [
                24
            ]
        },
        "ProductConnection": {
            "edges": [
                15
            ],
            "pageInfo": [
                12
            ],
            "__typename": [
                24
            ]
        },
        "ProductEdge": {
            "cursor": [
                24
            ],
            "node": [
                13
            ],
            "__typename": [
                24
            ]
        },
        "ProductOption": {
            "name": [
                24
            ],
            "values": [
                24
            ],
            "__typename": [
                24
            ]
        },
        "ProductStatus": {},
        "ProductVariant": {
            "availableForSale": [
                0
            ],
            "compareAtPrice": [
                11
            ],
            "id": [
                8
            ],
            "inventoryPolicy": [
                21
            ],
            "price": [
                11
            ],
            "selectedOptions": [
                23
            ],
            "sku": [
                24
            ],
            "title": [
                24
            ],
            "updatedAt": [
                5
            ],
            "__typename": [
                24
            ]
        },
        "ProductVariantConnection": {
            "edges": [
                20
            ],
            "pageInfo": [
                12
            ],
            "__typename": [
                24
            ]
        },
        "ProductVariantEdge": {
            "cursor": [
                24
            ],
            "node": [
                18
            ],
            "__typename": [
                24
            ]
        },
        "ProductVariantInventoryPolicy": {},
        "Query": {
            "collections": [
                2,
                {
                    "after": [
                        24
                    ],
                    "first": [
                        10,
                        "Int!"
                    ],
                    "query": [
                        24
                    ]
                }
            ],
            "product": [
                13,
                {
                    "id": [
                        8,
                        "ID!"
                    ]
                }
            ],
            "products": [
                14,
                {
                    "after": [
                        24
                    ],
                    "first": [
                        10,
                        "Int!"
                    ],
                    "query": [
                        24
                    ]
                }
            ],
            "__typename": [
                24
            ]
        },
        "SelectedOption": {
            "name": [
                24
            ],
            "value": [
                24
            ],
            "__typename": [
                24
            ]
        },
        "String": {},
        "URL": {}
    }
}