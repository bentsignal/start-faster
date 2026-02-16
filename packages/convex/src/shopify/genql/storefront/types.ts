export default {
    "scalars": [
        0,
        12,
        13,
        14,
        15,
        19,
        20
    ],
    "types": {
        "Boolean": {},
        "Cart": {
            "checkoutUrl": [
                20
            ],
            "id": [
                14
            ],
            "lines": [
                5,
                {
                    "first": [
                        15,
                        "Int!"
                    ]
                }
            ],
            "__typename": [
                19
            ]
        },
        "CartCreatePayload": {
            "cart": [
                1
            ],
            "userErrors": [
                10
            ],
            "warnings": [
                11
            ],
            "__typename": [
                19
            ]
        },
        "CartInput": {
            "lines": [
                8
            ],
            "__typename": [
                19
            ]
        },
        "CartLine": {
            "cost": [
                6
            ],
            "id": [
                14
            ],
            "quantity": [
                15
            ],
            "__typename": [
                19
            ]
        },
        "CartLineConnection": {
            "edges": [
                7
            ],
            "__typename": [
                19
            ]
        },
        "CartLineCost": {
            "amountPerQuantity": [
                16
            ],
            "__typename": [
                19
            ]
        },
        "CartLineEdge": {
            "cursor": [
                19
            ],
            "node": [
                4
            ],
            "__typename": [
                19
            ]
        },
        "CartLineInput": {
            "merchandiseId": [
                14
            ],
            "quantity": [
                15
            ],
            "__typename": [
                19
            ]
        },
        "CartLinesAddPayload": {
            "cart": [
                1
            ],
            "userErrors": [
                10
            ],
            "warnings": [
                11
            ],
            "__typename": [
                19
            ]
        },
        "CartUserError": {
            "field": [
                19
            ],
            "message": [
                19
            ],
            "__typename": [
                19
            ]
        },
        "CartWarning": {
            "code": [
                19
            ],
            "message": [
                19
            ],
            "__typename": [
                19
            ]
        },
        "CurrencyCode": {},
        "Decimal": {},
        "ID": {},
        "Int": {},
        "MoneyV2": {
            "amount": [
                13
            ],
            "currencyCode": [
                12
            ],
            "__typename": [
                19
            ]
        },
        "Mutation": {
            "cartCreate": [
                2,
                {
                    "input": [
                        3
                    ]
                }
            ],
            "cartLinesAdd": [
                9,
                {
                    "cartId": [
                        14,
                        "ID!"
                    ],
                    "lines": [
                        8,
                        "[CartLineInput!]!"
                    ]
                }
            ],
            "__typename": [
                19
            ]
        },
        "Query": {
            "shopName": [
                19
            ],
            "__typename": [
                19
            ]
        },
        "String": {},
        "URL": {}
    }
}