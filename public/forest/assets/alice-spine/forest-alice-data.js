window.AliceSkeletonData = {
  "skeleton": {
    "spine": "4.2.00",
    "hash": "forest-alice-fk-v1",
    "x": -43,
    "y": -3,
    "width": 144,
    "height": 122,
    "fps": 60,
    "images": "./images/"
  },
  "bones": [
    {
      "name": "root"
    },
    {
      "name": "pelvis",
      "parent": "root",
      "y": 29
    },
    {
      "name": "body",
      "parent": "pelvis",
      "length": 29
    },
    {
      "name": "head",
      "parent": "body",
      "y": 44
    },
    {
      "name": "hair",
      "parent": "head",
      "y": -2
    },
    {
      "name": "hat",
      "parent": "head",
      "y": 13
    },
    {
      "name": "skirt",
      "parent": "pelvis",
      "y": 2
    },
    {
      "name": "skirtL",
      "parent": "skirt",
      "x": -5
    },
    {
      "name": "skirtR",
      "parent": "skirt",
      "x": 5
    },
    {
      "name": "thighBack",
      "parent": "pelvis",
      "x": -6,
      "rotation": -109,
      "length": 15
    },
    {
      "name": "shinBack",
      "parent": "thighBack",
      "x": 15,
      "rotation": 24,
      "length": 15
    },
    {
      "name": "footBack",
      "parent": "shinBack",
      "x": 15,
      "rotation": 85
    },
    {
      "name": "thighFront",
      "parent": "pelvis",
      "x": 6,
      "rotation": -69,
      "length": 15
    },
    {
      "name": "shinFront",
      "parent": "thighFront",
      "x": 15,
      "rotation": -25,
      "length": 15
    },
    {
      "name": "footFront",
      "parent": "shinFront",
      "x": 15,
      "rotation": 94
    },
    {
      "name": "armBack",
      "parent": "body",
      "x": -9,
      "y": 23,
      "rotation": -110,
      "length": 18
    },
    {
      "name": "forearmBack",
      "parent": "armBack",
      "x": 18,
      "rotation": -20,
      "length": 17
    },
    {
      "name": "handBack",
      "parent": "forearmBack",
      "x": 17
    },
    {
      "name": "armFront",
      "parent": "body",
      "x": 9,
      "y": 23,
      "rotation": -100,
      "length": 19
    },
    {
      "name": "forearmFront",
      "parent": "armFront",
      "x": 19,
      "rotation": 115,
      "length": 19
    },
    {
      "name": "handFront",
      "parent": "forearmFront",
      "x": 19
    },
    {
      "name": "weapon",
      "parent": "handFront",
      "rotation": -60,
      "length": 100
    },
    {
      "name": "ribbon",
      "parent": "body",
      "x": -7,
      "y": 28
    }
  ],
  "slots": [
    {
      "name": "hairBack",
      "bone": "hair",
      "attachment": "hairBack"
    },
    {
      "name": "upperLegBack",
      "bone": "thighBack",
      "attachment": "upperLegBack"
    },
    {
      "name": "lowerLegBack",
      "bone": "shinBack",
      "attachment": "lowerLegBack"
    },
    {
      "name": "shoeBack",
      "bone": "footBack",
      "attachment": "shoeBack"
    },
    {
      "name": "upperLegFront",
      "bone": "thighFront",
      "attachment": "upperLegFront"
    },
    {
      "name": "lowerLegFront",
      "bone": "shinFront",
      "attachment": "lowerLegFront"
    },
    {
      "name": "shoeFront",
      "bone": "footFront",
      "attachment": "shoeFront"
    },
    {
      "name": "upperArmBack",
      "bone": "armBack",
      "attachment": "upperArmBack"
    },
    {
      "name": "forearmBack",
      "bone": "forearmBack",
      "attachment": "forearmBack"
    },
    {
      "name": "handBack",
      "bone": "handBack",
      "attachment": "handBack"
    },
    {
      "name": "torso",
      "bone": "body",
      "attachment": "torso"
    },
    {
      "name": "neck",
      "bone": "body",
      "attachment": "neck"
    },
    {
      "name": "skirtBack",
      "bone": "skirt",
      "attachment": "skirtBack"
    },
    {
      "name": "skirtLeft",
      "bone": "skirtL",
      "attachment": "skirtLeft"
    },
    {
      "name": "skirtRight",
      "bone": "skirtR",
      "attachment": "skirtRight"
    },
    {
      "name": "apron",
      "bone": "skirt",
      "attachment": "apron"
    },
    {
      "name": "head",
      "bone": "head",
      "attachment": "head"
    },
    {
      "name": "hairFront",
      "bone": "head",
      "attachment": "hairFront"
    },
    {
      "name": "hat",
      "bone": "hat",
      "attachment": "hat"
    },
    {
      "name": "ribbon",
      "bone": "ribbon",
      "attachment": "ribbon"
    },
    {
      "name": "upperArmFront",
      "bone": "armFront",
      "attachment": "upperArmFront"
    },
    {
      "name": "forearmFront",
      "bone": "forearmFront",
      "attachment": "forearmFront"
    },
    {
      "name": "umbrella",
      "bone": "weapon",
      "attachment": "umbrellaClosed"
    },
    {
      "name": "handFront",
      "bone": "handFront",
      "attachment": "handFront"
    }
  ],
  "skins": [
    {
      "name": "default",
      "attachments": {
        "hairBack": {
          "hairBack": {
            "type": "region",
            "path": "hairBack",
            "width": 128,
            "height": 128
          }
        },
        "upperLegBack": {
          "upperLegBack": {
            "type": "region",
            "path": "upperLegBack",
            "width": 128,
            "height": 128
          }
        },
        "lowerLegBack": {
          "lowerLegBack": {
            "type": "region",
            "path": "lowerLegBack",
            "width": 128,
            "height": 128
          }
        },
        "shoeBack": {
          "shoeBack": {
            "type": "region",
            "path": "shoeBack",
            "width": 128,
            "height": 128
          }
        },
        "upperLegFront": {
          "upperLegFront": {
            "type": "region",
            "path": "upperLegFront",
            "width": 128,
            "height": 128
          }
        },
        "lowerLegFront": {
          "lowerLegFront": {
            "type": "region",
            "path": "lowerLegFront",
            "width": 128,
            "height": 128
          }
        },
        "shoeFront": {
          "shoeFront": {
            "type": "region",
            "path": "shoeFront",
            "width": 128,
            "height": 128
          }
        },
        "upperArmBack": {
          "upperArmBack": {
            "type": "region",
            "path": "upperArmBack",
            "width": 128,
            "height": 128
          }
        },
        "forearmBack": {
          "forearmBack": {
            "type": "region",
            "path": "forearmBack",
            "width": 128,
            "height": 128
          }
        },
        "handBack": {
          "handBack": {
            "type": "region",
            "path": "handBack",
            "width": 128,
            "height": 128
          }
        },
        "torso": {
          "torso": {
            "type": "region",
            "path": "torso",
            "width": 128,
            "height": 128
          }
        },
        "neck": {
          "neck": {
            "type": "region",
            "path": "neck",
            "width": 128,
            "height": 128
          }
        },
        "skirtBack": {
          "skirtBack": {
            "type": "region",
            "path": "skirtBack",
            "width": 128,
            "height": 128
          }
        },
        "skirtLeft": {
          "skirtLeft": {
            "type": "region",
            "path": "skirtLeft",
            "width": 128,
            "height": 128
          }
        },
        "skirtRight": {
          "skirtRight": {
            "type": "region",
            "path": "skirtRight",
            "width": 128,
            "height": 128
          }
        },
        "apron": {
          "apron": {
            "type": "region",
            "path": "apron",
            "width": 128,
            "height": 128
          }
        },
        "head": {
          "head": {
            "type": "region",
            "path": "head",
            "width": 128,
            "height": 128
          },
          "headTired": {
            "type": "region",
            "path": "headTired",
            "width": 128,
            "height": 128
          }
        },
        "hairFront": {
          "hairFront": {
            "type": "region",
            "path": "hairFront",
            "width": 128,
            "height": 128
          }
        },
        "hat": {
          "hat": {
            "type": "region",
            "path": "hat",
            "width": 128,
            "height": 128
          }
        },
        "ribbon": {
          "ribbon": {
            "type": "region",
            "path": "ribbon",
            "width": 128,
            "height": 128
          }
        },
        "upperArmFront": {
          "upperArmFront": {
            "type": "region",
            "path": "upperArmFront",
            "width": 128,
            "height": 128
          }
        },
        "forearmFront": {
          "forearmFront": {
            "type": "region",
            "path": "forearmFront",
            "width": 128,
            "height": 128
          }
        },
        "umbrella": {
          "umbrellaClosed": {
            "type": "region",
            "path": "umbrellaClosed",
            "width": 128,
            "height": 128,
            "x": 43
          },
          "umbrellaOpen": {
            "type": "region",
            "path": "umbrellaOpen",
            "width": 128,
            "height": 128,
            "y": 43
          }
        },
        "handFront": {
          "handFront": {
            "type": "region",
            "path": "handFront",
            "width": 128,
            "height": 128
          }
        }
      }
    }
  ],
  "events": {
    "umbrellaHit": {}
  },
  "animations": {
    "idle": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": 0
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": 0
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 3
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": -3
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 2
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": -2
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": -1.4
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": 1.4
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 4.199999999999999
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": -4.199999999999999
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": 0
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": 0
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": 0
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": 0
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.3,
              "x": 0,
              "y": 1.2
            },
            {
              "time": 0.6,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.9,
              "x": 0,
              "y": -1
            },
            {
              "time": 1.2,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.3,
              "value": -4.294368257941954
            },
            {
              "time": 0.6,
              "value": -4.294368257941954
            },
            {
              "time": 0.9,
              "value": -4.294368257941954
            },
            {
              "time": 1.2,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.3,
              "value": -0.3611315058800528
            },
            {
              "time": 0.6,
              "value": -0.3611315058800528
            },
            {
              "time": 0.9,
              "value": -0.3611315058800528
            },
            {
              "time": 1.2,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.3,
              "value": 4.655499763822007
            },
            {
              "time": 0.6,
              "value": 4.655499763822007
            },
            {
              "time": 0.9,
              "value": 4.655499763822007
            },
            {
              "time": 1.2,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            },
            {
              "time": 0.9,
              "value": 0
            },
            {
              "time": 1.2,
              "value": 0
            }
          ]
        }
      }
    },
    "walk": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": -5
            },
            {
              "time": 0.145,
              "value": -5
            },
            {
              "time": 0.29,
              "value": -5
            },
            {
              "time": 0.435,
              "value": -5
            },
            {
              "time": 0.58,
              "value": -5
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 2.5
            },
            {
              "time": 0.145,
              "value": 2.5
            },
            {
              "time": 0.29,
              "value": 2.5
            },
            {
              "time": 0.435,
              "value": 2.5
            },
            {
              "time": 0.58,
              "value": 2.5
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": -7
            },
            {
              "time": 0.145,
              "value": -3
            },
            {
              "time": 0.29,
              "value": -6.999999999999999
            },
            {
              "time": 0.435,
              "value": -11
            },
            {
              "time": 0.58,
              "value": -7.000000000000001
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 8
            },
            {
              "time": 0.29,
              "value": 9.797174393178826e-16
            },
            {
              "time": 0.435,
              "value": -8
            },
            {
              "time": 0.58,
              "value": -1.959434878635765e-15
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": -5.6
            },
            {
              "time": 0.29,
              "value": -6.858022075225178e-16
            },
            {
              "time": 0.435,
              "value": 5.6
            },
            {
              "time": 0.58,
              "value": 1.3716044150450355e-15
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": -9.799999999999999
            },
            {
              "time": 0.145,
              "value": -4.199999999999999
            },
            {
              "time": 0.29,
              "value": -9.799999999999999
            },
            {
              "time": 0.435,
              "value": -15.399999999999999
            },
            {
              "time": 0.58,
              "value": -9.8
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 25
            },
            {
              "time": 0.29,
              "value": 3.061616997868383e-15
            },
            {
              "time": 0.435,
              "value": -25
            },
            {
              "time": 0.58,
              "value": -6.123233995736766e-15
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": -25
            },
            {
              "time": 0.29,
              "value": -3.061616997868383e-15
            },
            {
              "time": 0.435,
              "value": 25
            },
            {
              "time": 0.58,
              "value": 6.123233995736766e-15
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 20
            },
            {
              "time": 0.29,
              "value": 2.4492935982947065e-15
            },
            {
              "time": 0.435,
              "value": 0
            },
            {
              "time": 0.58,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 0
            },
            {
              "time": 0.29,
              "value": 0
            },
            {
              "time": 0.435,
              "value": 20
            },
            {
              "time": 0.58,
              "value": 4.898587196589413e-15
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.145,
              "x": 0,
              "y": 2
            },
            {
              "time": 0.29,
              "x": 0,
              "y": 2.4492935982947064e-16
            },
            {
              "time": 0.435,
              "x": 0,
              "y": 2
            },
            {
              "time": 0.58,
              "x": 0,
              "y": 4.898587196589413e-16
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.145,
              "value": -4.294368257941954
            },
            {
              "time": 0.29,
              "value": -4.294368257941954
            },
            {
              "time": 0.435,
              "value": -4.294368257941954
            },
            {
              "time": 0.58,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.145,
              "value": -0.3611315058800528
            },
            {
              "time": 0.29,
              "value": -0.3611315058800528
            },
            {
              "time": 0.435,
              "value": -0.3611315058800528
            },
            {
              "time": 0.58,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": -13.344500236177993
            },
            {
              "time": 0.145,
              "value": -13.344500236177993
            },
            {
              "time": 0.29,
              "value": -13.344500236177993
            },
            {
              "time": 0.435,
              "value": -13.344500236177993
            },
            {
              "time": 0.58,
              "value": -13.344500236177993
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 0
            },
            {
              "time": 0.29,
              "value": 0
            },
            {
              "time": 0.435,
              "value": 0
            },
            {
              "time": 0.58,
              "value": 0
            }
          ]
        }
      }
    },
    "depart": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": -5
            },
            {
              "time": 0.145,
              "value": -5
            },
            {
              "time": 0.29,
              "value": -5
            },
            {
              "time": 0.435,
              "value": -5
            },
            {
              "time": 0.58,
              "value": -5
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 2.5
            },
            {
              "time": 0.145,
              "value": 2.5
            },
            {
              "time": 0.29,
              "value": 2.5
            },
            {
              "time": 0.435,
              "value": 2.5
            },
            {
              "time": 0.58,
              "value": 2.5
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": -7
            },
            {
              "time": 0.145,
              "value": -3
            },
            {
              "time": 0.29,
              "value": -6.999999999999999
            },
            {
              "time": 0.435,
              "value": -11
            },
            {
              "time": 0.58,
              "value": -7.000000000000001
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 8
            },
            {
              "time": 0.29,
              "value": 9.797174393178826e-16
            },
            {
              "time": 0.435,
              "value": -8
            },
            {
              "time": 0.58,
              "value": -1.959434878635765e-15
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": -5.6
            },
            {
              "time": 0.29,
              "value": -6.858022075225178e-16
            },
            {
              "time": 0.435,
              "value": 5.6
            },
            {
              "time": 0.58,
              "value": 1.3716044150450355e-15
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": -9.799999999999999
            },
            {
              "time": 0.145,
              "value": -4.199999999999999
            },
            {
              "time": 0.29,
              "value": -9.799999999999999
            },
            {
              "time": 0.435,
              "value": -15.399999999999999
            },
            {
              "time": 0.58,
              "value": -9.8
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 25
            },
            {
              "time": 0.29,
              "value": 3.061616997868383e-15
            },
            {
              "time": 0.435,
              "value": -25
            },
            {
              "time": 0.58,
              "value": -6.123233995736766e-15
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": -25
            },
            {
              "time": 0.29,
              "value": -3.061616997868383e-15
            },
            {
              "time": 0.435,
              "value": 25
            },
            {
              "time": 0.58,
              "value": 6.123233995736766e-15
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 20
            },
            {
              "time": 0.29,
              "value": 2.4492935982947065e-15
            },
            {
              "time": 0.435,
              "value": 0
            },
            {
              "time": 0.58,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 0
            },
            {
              "time": 0.29,
              "value": 0
            },
            {
              "time": 0.435,
              "value": 20
            },
            {
              "time": 0.58,
              "value": 4.898587196589413e-15
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.145,
              "x": 0,
              "y": 2
            },
            {
              "time": 0.29,
              "x": 0,
              "y": 2.4492935982947064e-16
            },
            {
              "time": 0.435,
              "x": 0,
              "y": 2
            },
            {
              "time": 0.58,
              "x": 0,
              "y": 4.898587196589413e-16
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.145,
              "value": -4.294368257941954
            },
            {
              "time": 0.29,
              "value": -4.294368257941954
            },
            {
              "time": 0.435,
              "value": -4.294368257941954
            },
            {
              "time": 0.58,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.145,
              "value": -0.3611315058800528
            },
            {
              "time": 0.29,
              "value": -0.3611315058800528
            },
            {
              "time": 0.435,
              "value": -0.3611315058800528
            },
            {
              "time": 0.58,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": -13.344500236177993
            },
            {
              "time": 0.145,
              "value": -13.344500236177993
            },
            {
              "time": 0.29,
              "value": -13.344500236177993
            },
            {
              "time": 0.435,
              "value": -13.344500236177993
            },
            {
              "time": 0.58,
              "value": -13.344500236177993
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.145,
              "value": 0
            },
            {
              "time": 0.29,
              "value": 0
            },
            {
              "time": 0.435,
              "value": 0
            },
            {
              "time": 0.58,
              "value": 0
            }
          ]
        }
      }
    },
    "telegraph": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 8
            },
            {
              "time": 0.45,
              "value": 10
            },
            {
              "time": 0.65,
              "value": 10
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": -4
            },
            {
              "time": 0.45,
              "value": -5
            },
            {
              "time": 0.65,
              "value": -5
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 8
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.65,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 8
            },
            {
              "time": 0.65,
              "value": 8
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.45,
              "value": -5.6
            },
            {
              "time": 0.65,
              "value": -5.6
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 11.2
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.65,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.65,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.65,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.65,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.65,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.2,
              "x": 0,
              "y": -4
            },
            {
              "time": 0.45,
              "x": 0,
              "y": -5
            },
            {
              "time": 0.65,
              "x": 0,
              "y": -5
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.2,
              "value": 154.8531024613536
            },
            {
              "time": 0.45,
              "value": 165.23633277572355
            },
            {
              "time": 0.65,
              "value": 165.23633277572355
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.2,
              "value": 14.783557671177306
            },
            {
              "time": 0.45,
              "value": 3.5443804238896632
            },
            {
              "time": 0.65,
              "value": 3.5443804238896632
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.2,
              "value": 5.363339867469136
            },
            {
              "time": 0.45,
              "value": 21.219286800386755
            },
            {
              "time": 0.65,
              "value": 21.219286800386755
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.65,
              "value": 0
            }
          ]
        }
      }
    },
    "triple": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 8
            },
            {
              "time": 0.16,
              "value": 12
            },
            {
              "time": 0.28,
              "value": -14
            },
            {
              "time": 0.4,
              "value": -7
            },
            {
              "time": 0.54,
              "value": -5
            },
            {
              "time": 0.7,
              "value": 8
            },
            {
              "time": 0.83,
              "value": 5
            },
            {
              "time": 0.98,
              "value": 9
            },
            {
              "time": 1.12,
              "value": -15
            },
            {
              "time": 1.25,
              "value": -11
            },
            {
              "time": 1.42,
              "value": -4
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": -4
            },
            {
              "time": 0.16,
              "value": -6
            },
            {
              "time": 0.28,
              "value": 7
            },
            {
              "time": 0.4,
              "value": 3.5
            },
            {
              "time": 0.54,
              "value": 2.5
            },
            {
              "time": 0.7,
              "value": -4
            },
            {
              "time": 0.83,
              "value": -2.5
            },
            {
              "time": 0.98,
              "value": -4.5
            },
            {
              "time": 1.12,
              "value": 7.5
            },
            {
              "time": 1.25,
              "value": 5.5
            },
            {
              "time": 1.42,
              "value": 2
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": 15
            },
            {
              "time": 0.4,
              "value": 10
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": -13
            },
            {
              "time": 0.83,
              "value": -10
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": 20
            },
            {
              "time": 1.25,
              "value": 15
            },
            {
              "time": 1.42,
              "value": 8
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": -12
            },
            {
              "time": 0.4,
              "value": -7
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 11
            },
            {
              "time": 0.83,
              "value": 0
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": -14
            },
            {
              "time": 1.25,
              "value": -10
            },
            {
              "time": 1.42,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": 8.399999999999999
            },
            {
              "time": 0.4,
              "value": 4.8999999999999995
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": -7.699999999999999
            },
            {
              "time": 0.83,
              "value": 0
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": 9.799999999999999
            },
            {
              "time": 1.25,
              "value": 7
            },
            {
              "time": 1.42,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": 21
            },
            {
              "time": 0.4,
              "value": 14
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": -18.2
            },
            {
              "time": 0.83,
              "value": -14
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": 28
            },
            {
              "time": 1.25,
              "value": 21
            },
            {
              "time": 1.42,
              "value": 11.2
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": 0
            },
            {
              "time": 0.4,
              "value": 0
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 0.83,
              "value": 0
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": 14
            },
            {
              "time": 1.25,
              "value": 14
            },
            {
              "time": 1.42,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": 0
            },
            {
              "time": 0.4,
              "value": 0
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 0.83,
              "value": 0
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": -14
            },
            {
              "time": 1.25,
              "value": -14
            },
            {
              "time": 1.42,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": 0
            },
            {
              "time": 0.4,
              "value": 0
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 0.83,
              "value": 0
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": 11.200000000000001
            },
            {
              "time": 1.25,
              "value": 11.200000000000001
            },
            {
              "time": 1.42,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": 0
            },
            {
              "time": 0.4,
              "value": 0
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 0.83,
              "value": 0
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.42,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.16,
              "x": 0,
              "y": -3
            },
            {
              "time": 0.28,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.4,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.54,
              "x": 0,
              "y": -4
            },
            {
              "time": 0.7,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.83,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.98,
              "x": 0,
              "y": -6
            },
            {
              "time": 1.12,
              "x": 5,
              "y": 0
            },
            {
              "time": 1.25,
              "x": 5,
              "y": 0
            },
            {
              "time": 1.42,
              "x": 0,
              "y": 0
            },
            {
              "time": 1.65,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": 159.28307871692246
            },
            {
              "time": 0.16,
              "value": 168.62676150514113
            },
            {
              "time": 0.28,
              "value": 44.56503747056582
            },
            {
              "time": 0.4,
              "value": 16.04321809751852
            },
            {
              "time": 0.54,
              "value": -7.727815654907644
            },
            {
              "time": 0.7,
              "value": 51.13951041489915
            },
            {
              "time": 0.83,
              "value": 108.10703710476321
            },
            {
              "time": 0.98,
              "value": 179.78229516560845
            },
            {
              "time": 1.12,
              "value": 49.970874101049986
            },
            {
              "time": 1.25,
              "value": 49.970874101049986
            },
            {
              "time": 1.42,
              "value": 12.01032249808975
            },
            {
              "time": 1.65,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": 15.824149628623047
            },
            {
              "time": 0.16,
              "value": 1.4862722814057605
            },
            {
              "time": 0.28,
              "value": -13.657358322584003
            },
            {
              "time": 0.4,
              "value": -31.36162574281353
            },
            {
              "time": 0.54,
              "value": -35.2116770460198
            },
            {
              "time": 0.7,
              "value": -17.279020829798284
            },
            {
              "time": 0.83,
              "value": -8.835661695472567
            },
            {
              "time": 0.98,
              "value": 9.120956494045032
            },
            {
              "time": 1.12,
              "value": -31.201952910411933
            },
            {
              "time": 1.25,
              "value": -31.201952910411933
            },
            {
              "time": 1.42,
              "value": -11.789348627851282
            },
            {
              "time": 1.65,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": -0.10722834554550786
            },
            {
              "time": 0.16,
              "value": 22.88696621345312
            },
            {
              "time": 0.28,
              "value": 18.092320852018176
            },
            {
              "time": 0.4,
              "value": 24.318407645295018
            },
            {
              "time": 0.54,
              "value": 17.939492700927445
            },
            {
              "time": 0.7,
              "value": 10.139510414899135
            },
            {
              "time": 0.83,
              "value": 15.728624590709344
            },
            {
              "time": 0.98,
              "value": 1.0967483403465508
            },
            {
              "time": 1.12,
              "value": 26.231078809361954
            },
            {
              "time": 1.25,
              "value": 26.231078809361954
            },
            {
              "time": 1.42,
              "value": 14.779026129761526
            },
            {
              "time": 1.65,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.16,
              "value": 0
            },
            {
              "time": 0.28,
              "value": 0
            },
            {
              "time": 0.4,
              "value": 0
            },
            {
              "time": 0.54,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 0.83,
              "value": 0
            },
            {
              "time": 0.98,
              "value": 0
            },
            {
              "time": 1.12,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.42,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        }
      },
      "events": [
        {
          "time": 0.28,
          "name": "umbrellaHit"
        },
        {
          "time": 0.7,
          "name": "umbrellaHit"
        },
        {
          "time": 1.12,
          "name": "umbrellaHit"
        }
      ]
    },
    "rush": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": -22
            },
            {
              "time": 0.125,
              "value": -22
            },
            {
              "time": 0.25,
              "value": -22
            },
            {
              "time": 0.375,
              "value": -22
            },
            {
              "time": 0.5,
              "value": -22
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 11
            },
            {
              "time": 0.125,
              "value": 11
            },
            {
              "time": 0.25,
              "value": 11
            },
            {
              "time": 0.375,
              "value": 11
            },
            {
              "time": 0.5,
              "value": 11
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 24
            },
            {
              "time": 0.125,
              "value": 24
            },
            {
              "time": 0.25,
              "value": 24
            },
            {
              "time": 0.375,
              "value": 24
            },
            {
              "time": 0.5,
              "value": 24
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": -14
            },
            {
              "time": 0.125,
              "value": -14
            },
            {
              "time": 0.25,
              "value": -14
            },
            {
              "time": 0.375,
              "value": -14
            },
            {
              "time": 0.5,
              "value": -14
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 9.799999999999999
            },
            {
              "time": 0.125,
              "value": 9.799999999999999
            },
            {
              "time": 0.25,
              "value": 9.799999999999999
            },
            {
              "time": 0.375,
              "value": 9.799999999999999
            },
            {
              "time": 0.5,
              "value": 9.799999999999999
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 33.599999999999994
            },
            {
              "time": 0.125,
              "value": 33.599999999999994
            },
            {
              "time": 0.25,
              "value": 33.599999999999994
            },
            {
              "time": 0.375,
              "value": 33.599999999999994
            },
            {
              "time": 0.5,
              "value": 33.599999999999994
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.125,
              "value": 17
            },
            {
              "time": 0.25,
              "value": 2.0818995585505003e-15
            },
            {
              "time": 0.375,
              "value": -17
            },
            {
              "time": 0.5,
              "value": -4.1637991171010006e-15
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.125,
              "value": -17
            },
            {
              "time": 0.25,
              "value": -2.0818995585505003e-15
            },
            {
              "time": 0.375,
              "value": 17
            },
            {
              "time": 0.5,
              "value": 4.1637991171010006e-15
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.125,
              "value": 13.600000000000001
            },
            {
              "time": 0.25,
              "value": 1.6655196468404002e-15
            },
            {
              "time": 0.375,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.125,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.375,
              "value": 13.600000000000001
            },
            {
              "time": 0.5,
              "value": 3.3310392936808004e-15
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": -7
            },
            {
              "time": 0.125,
              "x": 0,
              "y": -7
            },
            {
              "time": 0.25,
              "x": 0,
              "y": -7
            },
            {
              "time": 0.375,
              "x": 0,
              "y": -7
            },
            {
              "time": 0.5,
              "x": 0,
              "y": -7
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": 48.888938123336345
            },
            {
              "time": 0.125,
              "value": 48.888938123336345
            },
            {
              "time": 0.25,
              "value": 48.888938123336345
            },
            {
              "time": 0.375,
              "value": 48.888938123336345
            },
            {
              "time": 0.5,
              "value": 48.888938123336345
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -17.359096331949758
            },
            {
              "time": 0.125,
              "value": -17.359096331949758
            },
            {
              "time": 0.25,
              "value": -17.359096331949758
            },
            {
              "time": 0.375,
              "value": -17.359096331949758
            },
            {
              "time": 0.5,
              "value": -17.359096331949758
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 15.470158208613412
            },
            {
              "time": 0.125,
              "value": 15.470158208613412
            },
            {
              "time": 0.25,
              "value": 15.470158208613412
            },
            {
              "time": 0.375,
              "value": 15.470158208613412
            },
            {
              "time": 0.5,
              "value": 15.470158208613412
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.125,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.375,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            }
          ]
        }
      }
    },
    "leap": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 10
            },
            {
              "time": 0.5,
              "value": -6
            },
            {
              "time": 0.75,
              "value": 10
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": -4
            },
            {
              "time": 0.25,
              "value": -16
            },
            {
              "time": 0.5,
              "value": 9
            },
            {
              "time": 0.75,
              "value": -16
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 2.8
            },
            {
              "time": 0.25,
              "value": 11.2
            },
            {
              "time": 0.5,
              "value": -6.3
            },
            {
              "time": 0.75,
              "value": 11.2
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 14
            },
            {
              "time": 0.5,
              "value": -8.399999999999999
            },
            {
              "time": 0.75,
              "value": 14
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 6
            },
            {
              "time": 0.25,
              "value": 26
            },
            {
              "time": 0.5,
              "value": -10
            },
            {
              "time": 0.75,
              "value": 26
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": -6
            },
            {
              "time": 0.25,
              "value": -26
            },
            {
              "time": 0.5,
              "value": 10
            },
            {
              "time": 0.75,
              "value": -26
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 4.800000000000001
            },
            {
              "time": 0.25,
              "value": 20.8
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 20.8
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 8
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": -4
            },
            {
              "time": 0.25,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.5,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.75,
              "x": 0,
              "y": 0
            },
            {
              "time": 1,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": 8.496972240076246
            },
            {
              "time": 0.25,
              "value": 70.10813011970075
            },
            {
              "time": 0.5,
              "value": 28.85425029278221
            },
            {
              "time": 0.75,
              "value": 70.10813011970075
            },
            {
              "time": 1,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": 39.93356858399454
            },
            {
              "time": 0.25,
              "value": 28.050818433738897
            },
            {
              "time": 0.5,
              "value": 43.551704122747566
            },
            {
              "time": 0.75,
              "value": 28.050818433738897
            },
            {
              "time": 1,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": -3.430540824070782
            },
            {
              "time": 0.25,
              "value": -53.15894855343964
            },
            {
              "time": 0.5,
              "value": -35.40595441552976
            },
            {
              "time": 0.75,
              "value": -53.15894855343964
            },
            {
              "time": 1,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        }
      },
      "slots": {
        "umbrella": {
          "attachment": [
            {
              "time": 0,
              "name": "umbrellaOpen"
            },
            {
              "time": 0.98,
              "name": "umbrellaClosed"
            }
          ]
        }
      }
    },
    "flowers": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 4
            },
            {
              "time": 0.44,
              "value": -3
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": -2
            },
            {
              "time": 0.44,
              "value": 1.5
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.22,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.44,
              "x": 0,
              "y": 0
            },
            {
              "time": 1.1,
              "x": 0,
              "y": 0
            },
            {
              "time": 1.98,
              "x": 0,
              "y": 0
            },
            {
              "time": 2.6,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.22,
              "value": 47.24778089583407
            },
            {
              "time": 0.44,
              "value": 45.376540151941605
            },
            {
              "time": 1.1,
              "value": 45.376540151941605
            },
            {
              "time": 1.98,
              "value": 45.376540151941605
            },
            {
              "time": 2.6,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.22,
              "value": -9.495561791668152
            },
            {
              "time": 0.44,
              "value": -5.753080303883209
            },
            {
              "time": 1.1,
              "value": -5.753080303883209
            },
            {
              "time": 1.98,
              "value": -5.753080303883209
            },
            {
              "time": 2.6,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.22,
              "value": 10.247780895834083
            },
            {
              "time": 0.44,
              "value": 6.3765401519416045
            },
            {
              "time": 1.1,
              "value": 5.3765401519416045
            },
            {
              "time": 1.98,
              "value": 5.3765401519416045
            },
            {
              "time": 2.6,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.22,
              "value": 0
            },
            {
              "time": 0.44,
              "value": 0
            },
            {
              "time": 1.1,
              "value": 0
            },
            {
              "time": 1.98,
              "value": 0
            },
            {
              "time": 2.6,
              "value": 0
            }
          ]
        }
      }
    },
    "summon": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 8
            },
            {
              "time": 0.3,
              "value": -11
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": -4
            },
            {
              "time": 0.3,
              "value": 5.5
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 13
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 18.2
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.15,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.3,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.6,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.15,
              "value": 144.774673322832
            },
            {
              "time": 0.3,
              "value": 48.161969284543375
            },
            {
              "time": 0.6,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.15,
              "value": 33.559861552490275
            },
            {
              "time": 0.3,
              "value": 7.600705846964473
            },
            {
              "time": 0.6,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.15,
              "value": -178.33453487532228
            },
            {
              "time": 0.3,
              "value": -55.76267513150786
            },
            {
              "time": 0.6,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.15,
              "value": -110
            },
            {
              "time": 0.3,
              "value": 120
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        }
      }
    },
    "hatThrow": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 5
            },
            {
              "time": 0.45,
              "value": -9
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": -2.5
            },
            {
              "time": 0.45,
              "value": 4.5
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.45,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.25,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.45,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.85,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.25,
              "value": 134.80371784965251
            },
            {
              "time": 0.45,
              "value": 73.20409717643454
            },
            {
              "time": 0.85,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.25,
              "value": 8.072947792514839
            },
            {
              "time": 0.45,
              "value": -10.481504229125875
            },
            {
              "time": 0.85,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.25,
              "value": -7.876665642167353
            },
            {
              "time": 0.45,
              "value": 42.277407052691316
            },
            {
              "time": 0.85,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": -160
            },
            {
              "time": 0.45,
              "value": 140
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        }
      }
    },
    "rain": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 5
            },
            {
              "time": 0.7,
              "value": -4
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": -2.5
            },
            {
              "time": 0.7,
              "value": 2
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 8
            },
            {
              "time": 0.7,
              "value": -4
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 11.2
            },
            {
              "time": 0.7,
              "value": -5.6
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.7,
              "value": 0
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.35,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.7,
              "x": 0,
              "y": 0
            },
            {
              "time": 1.15,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.35,
              "value": -4.294368257941954
            },
            {
              "time": 0.7,
              "value": -4.294368257941954
            },
            {
              "time": 1.15,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.35,
              "value": -0.3611315058800528
            },
            {
              "time": 0.7,
              "value": -0.3611315058800528
            },
            {
              "time": 1.15,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.35,
              "value": 4.655499763822007
            },
            {
              "time": 0.7,
              "value": 4.655499763822007
            },
            {
              "time": 1.15,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.35,
              "value": -160
            },
            {
              "time": 0.7,
              "value": -135
            },
            {
              "time": 1.15,
              "value": 0
            }
          ]
        }
      }
    },
    "ricochet": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 12
            },
            {
              "time": 0.36,
              "value": -19
            },
            {
              "time": 0.55,
              "value": -7
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": -6
            },
            {
              "time": 0.36,
              "value": 9.5
            },
            {
              "time": 0.55,
              "value": 3.5
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": 18
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": -10
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": 7
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": 25.2
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": 0
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": 0
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": 0
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": 0
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.2,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.36,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.55,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.85,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.2,
              "value": 183.0540156803396
            },
            {
              "time": 0.36,
              "value": 55.45752117565291
            },
            {
              "time": 0.55,
              "value": 40.351184386378165
            },
            {
              "time": 0.85,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.2,
              "value": 6.3842931644311705
            },
            {
              "time": 0.36,
              "value": -30.005859329080252
            },
            {
              "time": 0.55,
              "value": -14.627013188807553
            },
            {
              "time": 0.85,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.2,
              "value": -9.438308844770773
            },
            {
              "time": 0.36,
              "value": 19.548338153427352
            },
            {
              "time": 0.55,
              "value": 9.275828802429388
            },
            {
              "time": 0.85,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.36,
              "value": 0
            },
            {
              "time": 0.55,
              "value": 0
            },
            {
              "time": 0.85,
              "value": 0
            }
          ]
        }
      }
    },
    "recover": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": -5
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 2.5
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 12
            },
            {
              "time": 0.25,
              "value": 5
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 5
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": -3.5
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 16.799999999999997
            },
            {
              "time": 0.25,
              "value": 7
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.25,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.75,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": 23.760543404718476
            },
            {
              "time": 0.25,
              "value": -4.294368257941954
            },
            {
              "time": 0.75,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -8.918267836733335
            },
            {
              "time": 0.25,
              "value": -0.3611315058800528
            },
            {
              "time": 0.75,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 2.1577244320148523
            },
            {
              "time": 0.25,
              "value": 4.655499763822007
            },
            {
              "time": 0.75,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            }
          ]
        }
      }
    },
    "hurt": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": 15
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": -7.5
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": -15
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": -21
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.06,
              "x": 0,
              "y": -4
            },
            {
              "time": 0.2,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.06,
              "value": -58.953919941512424
            },
            {
              "time": 0.2,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.06,
              "value": 34.32902615802411
            },
            {
              "time": 0.2,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.06,
              "value": 24.624893783488297
            },
            {
              "time": 0.2,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.06,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            }
          ]
        }
      }
    },
    "defeated": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": -10
            },
            {
              "time": 0.8,
              "value": -18
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 5
            },
            {
              "time": 0.8,
              "value": 9
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.8,
              "value": 3
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.8,
              "value": 12
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.8,
              "value": -8.399999999999999
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.8,
              "value": 4.199999999999999
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": -35
            },
            {
              "time": 0.8,
              "value": -58
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 35
            },
            {
              "time": 0.8,
              "value": 58
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.8,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 28
            },
            {
              "time": 0.8,
              "value": 46.400000000000006
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.3,
              "x": 0,
              "y": -15
            },
            {
              "time": 0.8,
              "x": 0,
              "y": -25
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.3,
              "value": -6.065470125121919
            },
            {
              "time": 0.8,
              "value": -14.438308844770802
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.3,
              "value": 7.130940250243839
            },
            {
              "time": 0.8,
              "value": 6.3842931644311705
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.3,
              "value": -26.06547012512192
            },
            {
              "time": 0.8,
              "value": -21.94598431966037
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.3,
              "value": 0
            },
            {
              "time": 0.8,
              "value": 0
            }
          ]
        }
      },
      "slots": {
        "head": {
          "attachment": [
            {
              "time": 0,
              "name": "headTired"
            }
          ]
        }
      }
    },
    "laugh": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 6
            },
            {
              "time": 0.25,
              "value": 13
            },
            {
              "time": 0.5,
              "value": 6
            },
            {
              "time": 0.75,
              "value": 13
            },
            {
              "time": 1,
              "value": 6
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": -3
            },
            {
              "time": 0.25,
              "value": -6.5
            },
            {
              "time": 0.5,
              "value": -3
            },
            {
              "time": 0.75,
              "value": -6.5
            },
            {
              "time": 1,
              "value": -3
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 8
            },
            {
              "time": 0.25,
              "value": -8
            },
            {
              "time": 0.5,
              "value": 8
            },
            {
              "time": 0.75,
              "value": -8
            },
            {
              "time": 1,
              "value": 8
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 11.2
            },
            {
              "time": 0.25,
              "value": -11.2
            },
            {
              "time": 0.5,
              "value": 11.2
            },
            {
              "time": 0.75,
              "value": -11.2
            },
            {
              "time": 1,
              "value": 11.2
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.25,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 0.75,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.25,
              "x": 0,
              "y": 2
            },
            {
              "time": 0.5,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.75,
              "x": 0,
              "y": 2
            },
            {
              "time": 1,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": 138.88893812333635
            },
            {
              "time": 0.25,
              "value": 138.88893812333635
            },
            {
              "time": 0.5,
              "value": 138.88893812333635
            },
            {
              "time": 0.75,
              "value": 138.88893812333635
            },
            {
              "time": 1,
              "value": 138.88893812333635
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -17.359096331949758
            },
            {
              "time": 0.25,
              "value": -17.359096331949758
            },
            {
              "time": 0.5,
              "value": -17.359096331949758
            },
            {
              "time": 0.75,
              "value": -17.359096331949758
            },
            {
              "time": 1,
              "value": -17.359096331949758
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 23.470158208613412
            },
            {
              "time": 0.25,
              "value": 23.470158208613412
            },
            {
              "time": 0.5,
              "value": 23.470158208613412
            },
            {
              "time": 0.75,
              "value": 23.470158208613412
            },
            {
              "time": 1,
              "value": 23.470158208613412
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": -55
            },
            {
              "time": 0.25,
              "value": -55
            },
            {
              "time": 0.5,
              "value": -55
            },
            {
              "time": 0.75,
              "value": -55
            },
            {
              "time": 1,
              "value": -55
            }
          ]
        }
      }
    },
    "counterStance": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 7
            },
            {
              "time": 0.5,
              "value": 7
            },
            {
              "time": 1,
              "value": 7
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": -3.5
            },
            {
              "time": 0.5,
              "value": -3.5
            },
            {
              "time": 1,
              "value": -3.5
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 4
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": -2.8
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.5,
              "x": 0,
              "y": 0
            },
            {
              "time": 1,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": 69.28307871692245
            },
            {
              "time": 0.5,
              "value": 69.28307871692245
            },
            {
              "time": 1,
              "value": 69.28307871692245
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": 15.824149628623047
            },
            {
              "time": 0.5,
              "value": 15.824149628623047
            },
            {
              "time": 1,
              "value": 15.824149628623047
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 41.892771654454506
            },
            {
              "time": 0.5,
              "value": 41.892771654454506
            },
            {
              "time": 1,
              "value": 41.892771654454506
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": -35
            },
            {
              "time": 0.5,
              "value": -35
            },
            {
              "time": 1,
              "value": -35
            }
          ]
        }
      }
    },
    "thorn": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 8
            },
            {
              "time": 1.25,
              "value": -6
            },
            {
              "time": 1.65,
              "value": -14
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": -4
            },
            {
              "time": 1.25,
              "value": 3
            },
            {
              "time": 1.65,
              "value": 7
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 16
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 22.4
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.5,
              "x": 0,
              "y": 0
            },
            {
              "time": 1.25,
              "x": 0,
              "y": 0
            },
            {
              "time": 1.65,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.5,
              "value": 152.5380189265373
            },
            {
              "time": 1.25,
              "value": 48.888938123336345
            },
            {
              "time": 1.65,
              "value": 51.7062315735394
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.5,
              "value": 24.866346728622347
            },
            {
              "time": 1.25,
              "value": -17.359096331949758
            },
            {
              "time": 1.65,
              "value": -30.643470279649605
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.5,
              "value": 2.595634344840306
            },
            {
              "time": 1.25,
              "value": 13.470158208613412
            },
            {
              "time": 1.65,
              "value": 23.937238706110215
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.5,
              "value": 0
            },
            {
              "time": 1.25,
              "value": 0
            },
            {
              "time": 1.65,
              "value": 0
            }
          ]
        }
      }
    },
    "cards": {
      "bones": {
        "body": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 9
            },
            {
              "time": 0.35,
              "value": -9
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "head": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": -4.5
            },
            {
              "time": 0.35,
              "value": 4.5
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "hair": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "skirtL": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "skirtR": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "ribbon": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "thighFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "thighBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "shinFront": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "shinBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": 0
            },
            {
              "time": 0.35,
              "value": 0
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        },
        "pelvis": {
          "translate": [
            {
              "time": 0,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.2,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.35,
              "x": 0,
              "y": 0
            },
            {
              "time": 0.6,
              "x": 0,
              "y": 0
            }
          ]
        },
        "armFront": {
          "rotate": [
            {
              "time": 0,
              "value": -4.294368257941954
            },
            {
              "time": 0.2,
              "value": -4.294368257941954
            },
            {
              "time": 0.35,
              "value": 48.021119186963446
            },
            {
              "time": 0.6,
              "value": -4.294368257941954
            }
          ]
        },
        "forearmFront": {
          "rotate": [
            {
              "time": 0,
              "value": -0.3611315058800528
            },
            {
              "time": 0.2,
              "value": -0.3611315058800528
            },
            {
              "time": 0.35,
              "value": -5.8371139689272695
            },
            {
              "time": 0.6,
              "value": -0.3611315058800528
            }
          ]
        },
        "weapon": {
          "rotate": [
            {
              "time": 0,
              "value": 4.655499763822007
            },
            {
              "time": 0.2,
              "value": 4.655499763822007
            },
            {
              "time": 0.35,
              "value": 12.815994781963823
            },
            {
              "time": 0.6,
              "value": 4.655499763822007
            }
          ]
        },
        "armBack": {
          "rotate": [
            {
              "time": 0,
              "value": 0
            },
            {
              "time": 0.2,
              "value": -130
            },
            {
              "time": 0.35,
              "value": 120
            },
            {
              "time": 0.6,
              "value": 0
            }
          ]
        }
      }
    }
  }
};
