import math
from typing import List, Optional, Tuple

# =========================================================
# BOOST TABLES
# =========================================================

boost_tables = {
    # =====================================================
    # BOOST 2
    # =====================================================
    "2": {
        1: 1,
        2: 2,
        3: 4,
        4: 6,
        5: 9,
        6: 12,
        7: 16,
        8: 20,
        9: 25,
        10: 30,
        11: 36,
        12: 42,
        13: 49,
        14: 56,
        15: 64,
        16: 72,
        17: 81,
        18: 90,
        19: 100,
        20: 110,
        21: 121,
        22: 132,
        23: 144,
        24: 156,
        25: 169,
        26: 182,
        27: 196,
        28: 210,
        29: 225,
        30: 240,
        31: 256,
        32: 272,
        33: 289,
        34: 306,
        35: 324,
        36: 342,
        37: 361,
        38: 380,
        39: 400,
        40: 420,
        41: 441,
        42: 462,
        43: 484,
        44: 506,
        45: 529,
        46: 552,
        47: 576,
        48: 600,
        49: 625,
        50: 650,
    },
    # =====================================================
    # BOOST 3
    # =====================================================
    "3": {
        1: 1,
        2: 2,
        3: 3,
        4: 5,
        5: 7,
        6: 9,
        7: 12,
        8: 15,
        9: 18,
        10: 22,
        11: 26,
        12: 30,
        13: 35,
        14: 40,
        15: 45,
        16: 51,
        17: 57,
        18: 63,
        19: 70,
        20: 77,
        21: 84,
        22: 92,
        23: 100,
        24: 108,
        25: 117,
        26: 126,
        27: 135,
        28: 145,
        29: 155,
        30: 165,
        31: 176,
        32: 187,
        33: 198,
        34: 210,
        35: 222,
        36: 234,
        37: 247,
        38: 260,
        39: 273,
        40: 287,
        41: 301,
        42: 315,
        43: 330,
        44: 345,
        45: 360,
        46: 376,
        47: 392,
        48: 408,
        49: 425,
        50: 442,
    },
    # =====================================================
    # BOOST 4
    # =====================================================
    "4": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 6,
        6: 8,
        7: 10,
        8: 12,
        9: 15,
        10: 18,
        11: 21,
        12: 24,
        13: 28,
        14: 32,
        15: 36,
        16: 40,
        17: 45,
        18: 50,
        19: 55,
        20: 60,
        21: 66,
        22: 72,
        23: 78,
        24: 84,
        25: 91,
        26: 98,
        27: 105,
        28: 112,
        29: 120,
        30: 128,
        31: 136,
        32: 144,
        33: 153,
        34: 162,
        35: 171,
        36: 180,
        37: 190,
        38: 200,
        39: 210,
        40: 220,
        41: 231,
        42: 242,
        43: 253,
        44: 264,
        45: 276,
        46: 288,
        47: 300,
        48: 312,
        49: 325,
        50: 338,
    },
    # =====================================================
    # BOOST 5
    # =====================================================
    "5": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 7,
        7: 9,
        8: 11,
        9: 13,
        10: 15,
        11: 18,
        12: 21,
        13: 24,
        14: 27,
        15: 30,
        16: 34,
        17: 38,
        18: 42,
        19: 46,
        20: 50,
        21: 55,
        22: 60,
        23: 65,
        24: 70,
        25: 75,
        26: 81,
        27: 87,
        28: 93,
        29: 99,
        30: 105,
        31: 112,
        32: 119,
        33: 126,
        34: 133,
        35: 140,
        36: 148,
        37: 156,
        38: 164,
        39: 172,
        40: 180,
        41: 189,
        42: 198,
        43: 207,
        44: 216,
        45: 225,
        46: 235,
        47: 245,
        48: 255,
        49: 265,
        50: 275,
    },
    # =====================================================
    # BOOST 6
    # =====================================================
    "6": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 8,
        8: 10,
        9: 12,
        10: 14,
        11: 16,
        12: 18,
        13: 21,
        14: 24,
        15: 27,
        16: 30,
        17: 33,
        18: 36,
        19: 40,
        20: 44,
        21: 48,
        22: 52,
        23: 56,
        24: 60,
        25: 65,
        26: 70,
        27: 75,
        28: 80,
        29: 85,
        30: 90,
        31: 96,
        32: 102,
        33: 108,
        34: 114,
        35: 120,
        36: 126,
        37: 133,
        38: 140,
        39: 147,
        40: 154,
        41: 161,
        42: 168,
        43: 176,
        44: 184,
        45: 192,
        46: 200,
        47: 208,
        48: 216,
        49: 225,
        50: 234,
    },
    # =====================================================
    # BOOST 7
    # =====================================================
    "7": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 9,
        9: 11,
        10: 13,
        11: 15,
        12: 17,
        13: 19,
        14: 21,
        15: 24,
        16: 27,
        17: 30,
        18: 33,
        19: 36,
        20: 39,
        21: 42,
        22: 46,
        23: 50,
        24: 54,
        25: 58,
        26: 62,
        27: 66,
        28: 70,
        29: 75,
        30: 80,
        31: 85,
        32: 90,
        33: 95,
        34: 100,
        35: 105,
        36: 111,
        37: 117,
        38: 123,
        39: 129,
        40: 135,
        41: 141,
        42: 147,
        43: 154,
        44: 161,
        45: 168,
        46: 175,
        47: 182,
        48: 189,
        49: 196,
        50: 204,
    },
    # =====================================================
    # BOOST 8
    # =====================================================
    "8": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 10,
        10: 12,
        11: 14,
        12: 16,
        13: 18,
        14: 20,
        15: 22,
        16: 24,
        17: 27,
        18: 30,
        19: 33,
        20: 36,
        21: 39,
        22: 42,
        23: 45,
        24: 48,
        25: 52,
        26: 56,
        27: 60,
        28: 64,
        29: 67,
        30: 72,
        31: 76,
        32: 80,
        33: 85,
        34: 90,
        35: 95,
        36: 100,
        37: 105,
        38: 110,
        39: 115,
        40: 120,
        41: 126,
        42: 132,
        43: 138,
        44: 144,
        45: 150,
        46: 156,
        47: 162,
        48: 168,
        49: 175,
        50: 182,
    },
    # =====================================================
    # BOOST 9
    # =====================================================
    "9": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 11,
        11: 13,
        12: 15,
        13: 17,
        14: 19,
        15: 21,
        16: 23,
        17: 25,
        18: 27,
        19: 30,
        20: 33,
        21: 36,
        22: 39,
        23: 42,
        24: 45,
        25: 48,
        26: 51,
        27: 54,
        28: 58,
        29: 62,
        30: 66,
        31: 70,
        32: 74,
        33: 78,
        34: 82,
        35: 86,
        36: 90,
        37: 95,
        38: 100,
        39: 105,
        40: 110,
        41: 115,
        42: 120,
        43: 125,
        44: 130,
        45: 135,
        46: 141,
        47: 147,
        48: 153,
        49: 159,
        50: 165,
    },
    # =====================================================
    # BOOST 10
    # =====================================================
    "10": {i: i for i in range(1, 51)},
    # =====================================================
    # BOOST 15
    # =====================================================
    "15": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 17,
        17: 19,
        18: 21,
        19: 23,
        20: 25,
        21: 27,
        22: 29,
        23: 31,
        24: 33,
        25: 35,
        26: 37,
        27: 39,
        28: 41,
        29: 43,
        30: 45,
        31: 48,
        32: 51,
        33: 54,
        34: 57,
        35: 60,
        36: 63,
        37: 66,
        38: 69,
        39: 72,
        40: 75,
        41: 78,
        42: 81,
        43: 84,
        44: 87,
        45: 90,
        46: 94,
        47: 98,
        48: 102,
        49: 106,
        50: 110,
    },
    # =====================================================
    # BOOST 20
    # =====================================================
    "20": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
        18: 18,
        19: 19,
        20: 20,
        21: 22,
        22: 24,
        23: 26,
        24: 28,
        25: 30,
        26: 32,
        27: 34,
        28: 36,
        29: 38,
        30: 40,
        31: 42,
        32: 44,
        33: 46,
        34: 48,
        35: 50,
        36: 52,
        37: 54,
        38: 56,
        39: 58,
        40: 60,
        41: 63,
        42: 66,
        43: 69,
        44: 72,
        45: 75,
        46: 78,
        47: 81,
        48: 84,
        49: 87,
        50: 90,
    },
    # =====================================================
    # BOOST 25
    # =====================================================
    "25": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
        18: 18,
        19: 19,
        20: 20,
        21: 21,
        22: 22,
        23: 23,
        24: 24,
        25: 25,
        26: 27,
        27: 29,
        28: 31,
        29: 33,
        30: 35,
        31: 37,
        32: 39,
        33: 41,
        34: 43,
        35: 45,
        36: 47,
        37: 49,
        38: 51,
        39: 53,
        40: 55,
        41: 57,
        42: 59,
        43: 61,
        44: 63,
        45: 65,
        46: 67,
        47: 69,
        48: 71,
        49: 73,
        50: 75,
    },
    # =====================================================
    # BOOST 30 NORMAL
    # =====================================================
    "30": {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
        18: 18,
        19: 19,
        20: 20,
        21: 21,
        22: 22,
        23: 23,
        24: 24,
        25: 25,
        26: 26,
        27: 27,
        28: 28,
        29: 29,
        30: 30,
        31: 32,
        32: 34,
        33: 36,
        34: 38,
        35: 40,
        36: 42,
        37: 44,
        38: 46,
        39: 48,
        40: 50,
        41: 52,
        42: 54,
        43: 56,
        44: 58,
        45: 60,
        46: 62,
        47: 64,
        48: 66,
        49: 68,
        50: 70,
    },
    # =====================================================
    # BOOST 30 SPECIAL
    # =====================================================
    "30_special": {
        1: 0,
        2: 1,
        3: 1,
        4: 2,
        5: 2,
        6: 3,
        7: 3,
        8: 4,
        9: 4,
        10: 5,
        11: 6,
        12: 7,
        13: 8,
        14: 9,
        15: 10,
        16: 11,
        17: 12,
        18: 13,
        19: 14,
        20: 15,
        21: 16,
        22: 17,
        23: 18,
        24: 19,
        25: 20,
        26: 21,
        27: 22,
        28: 23,
        29: 24,
        30: 25,
        31: 27,
        32: 29,
        33: 31,
        34: 33,
        35: 35,
        36: 37,
        37: 39,
        38: 41,
        39: 43,
        40: 45,
        41: 47,
        42: 49,
        43: 51,
        44: 53,
        45: 55,
        46: 57,
        47: 59,
        48: 61,
        49: 63,
        50: 65,
    },
    # =====================================================
    # BOOST 50 NORMAL
    # =====================================================
    "50": {i: i for i in range(1, 51)},
    # =====================================================
    # BOOST 50 SPECIAL
    # =====================================================
    "50_special": {
        1: 0,
        2: 1,
        3: 1,
        4: 2,
        5: 2,
        6: 3,
        7: 3,
        8: 4,
        9: 4,
        10: 5,
        11: 6,
        12: 7,
        13: 8,
        14: 9,
        15: 10,
        16: 11,
        17: 12,
        18: 13,
        19: 14,
        20: 15,
        21: 16,
        22: 17,
        23: 18,
        24: 19,
        25: 20,
        26: 21,
        27: 22,
        28: 23,
        29: 24,
        30: 25,
        31: 26,
        32: 27,
        33: 28,
        34: 29,
        35: 30,
        36: 31,
        37: 32,
        38: 33,
        39: 34,
        40: 35,
        41: 36,
        42: 37,
        43: 38,
        44: 39,
        45: 40,
        46: 41,
        47: 42,
        48: 43,
        49: 44,
        50: 45,
    },
}

BALLS_TYPE_MAP = {
    "Moon Ball": ["Dark", "Ghost"],
    "Tinker Ball": ["Electric", "Steel"],
    "Sora Ball": ["Ice", "Gelo", "Flying", "Voador"],
    "Dusk Ball": ["Rock", "Fighting"],
    "Yume Ball": ["Normal", "Psychic", "Psíquico", "Psiquico"],
    "Tale Ball": ["Dragon", "Dragão", "Dragao", "Fada", "Fairy", "Cristal"],
    "Net Ball": ["Bug", "Inseto", "Water", "Água", "Agua"],
    "Janguru Ball": ["Poison", "Veneno", "Grass", "Planta"],
    "Magu Ball": ["Fire", "Fogo", "Ground", "Terra"],
    "Fast Ball": ["Fast", "FAST"],
    "Heavy Ball": ["Heavy", "HEAVY"],
}

BALLS_DISPLAY_TYPES = {
    "Moon Ball": ["Dark", "Ghost"],
    "Tinker Ball": ["Electric", "Metal"],
    "Sora Ball": ["Ice", "Flying"],
    "Dusk Ball": ["Rock", "Fighting"],
    "Yume Ball": ["Normal", "Psychic"],
    "Tale Ball": ["Dragon", "Fairy", "Crystal"],
    "Net Ball": ["Bug", "Water"],
    "Janguru Ball": ["Poison", "Grass"],
    "Magu Ball": ["Fire", "Ground"],
    "Fast Ball": ["Fast"],
    "Heavy Ball": ["Heavy"],
}

TYPE_TO_BALL = {}
for ball, types in BALLS_TYPE_MAP.items():
    for type_name in types:
        token = (
            type_name.lower()
            .replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
            .replace("ã", "a")
            .replace("â", "a")
            .replace("ç", "c")
        )
        TYPE_TO_BALL[token] = ball

TYPE_ALIASES = {
    "normal": "Normal",
    "fire": "Fire",
    "fogo": "Fire",
    "water": "Water",
    "agua": "Water",
    "água": "Water",
    "grass": "Grass",
    "planta": "Grass",
    "electric": "Electric",
    "eléctrico": "Electric",
    "eletrico": "Electric",
    "ice": "Ice",
    "gelo": "Ice",
    "fighting": "Fighting",
    "lutador": "Fighting",
    "poison": "Poison",
    "veneno": "Poison",
    "ground": "Ground",
    "terra": "Ground",
    "flying": "Flying",
    "voador": "Flying",
    "psychic": "Psychic",
    "psíquico": "Psychic",
    "psiquico": "Psychic",
    "bug": "Bug",
    "inseto": "Bug",
    "rock": "Rock",
    "pedra": "Rock",
    "ghost": "Ghost",
    "fantasma": "Ghost",
    "dragon": "Dragon",
    "dragão": "Dragon",
    "dragao": "Dragon",
    "dark": "Dark",
    "noturno": "Dark",
    "steel": "Steel",
    "metal": "Steel",
    "fairy": "Fairy",
    "fada": "Fairy",
    "crystal": "Crystal",
    "cristal": "Crystal",
}

TYPE_EFFECTIVENESS = {
    "Normal": {
        "Normal": 1,
        "Fire": 1,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 0.5,
        "Ghost": 0,
        "Dragon": 1,
        "Dark": 1,
        "Steel": 0.5,
        "Fairy": 1,
        "Crystal": 0.5,
    },
    "Fire": {
        "Normal": 1,
        "Fire": 0.5,
        "Water": 0.5,
        "Grass": 2,
        "Electric": 1,
        "Ice": 2,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 2,
        "Rock": 0.5,
        "Ghost": 1,
        "Dragon": 0.5,
        "Dark": 1,
        "Steel": 2,
        "Fairy": 1,
        "Crystal": 2,
    },
    "Water": {
        "Normal": 1,
        "Fire": 2,
        "Water": 0.5,
        "Grass": 0.5,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 2,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 2,
        "Ghost": 1,
        "Dragon": 0.5,
        "Dark": 1,
        "Steel": 1,
        "Fairy": 1,
        "Crystal": 0.5,
    },
    "Grass": {
        "Normal": 1,
        "Fire": 0.5,
        "Water": 2,
        "Grass": 0.5,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 0.5,
        "Ground": 2,
        "Flying": 0.5,
        "Psychic": 1,
        "Bug": 0.5,
        "Rock": 2,
        "Ghost": 1,
        "Dragon": 0.5,
        "Dark": 1,
        "Steel": 0.5,
        "Fairy": 1,
        "Crystal": 2,
    },
    "Electric": {
        "Normal": 1,
        "Fire": 1,
        "Water": 2,
        "Grass": 0.5,
        "Electric": 0.5,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 0,
        "Flying": 2,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 1,
        "Dragon": 0.5,
        "Dark": 1,
        "Steel": 1,
        "Fairy": 1,
        "Crystal": 0,
    },
    "Ice": {
        "Normal": 1,
        "Fire": 0.5,
        "Water": 0.5,
        "Grass": 2,
        "Electric": 1,
        "Ice": 0.5,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 2,
        "Flying": 2,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 1,
        "Dragon": 2,
        "Dark": 1,
        "Steel": 0.5,
        "Fairy": 1,
        "Crystal": 0.5,
    },
    "Fighting": {
        "Normal": 2,
        "Fire": 1,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 2,
        "Fighting": 1,
        "Poison": 0.5,
        "Ground": 1,
        "Flying": 0.5,
        "Psychic": 0.5,
        "Bug": 0.5,
        "Rock": 2,
        "Ghost": 0,
        "Dragon": 1,
        "Dark": 2,
        "Steel": 2,
        "Fairy": 0.5,
        "Crystal": 2,
    },
    "Poison": {
        "Normal": 1,
        "Fire": 1,
        "Water": 1,
        "Grass": 2,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 0.5,
        "Ground": 0.5,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 0.5,
        "Ghost": 0.5,
        "Dragon": 1,
        "Dark": 1,
        "Steel": 0,
        "Fairy": 2,
        "Crystal": 2,
    },
    "Ground": {
        "Normal": 1,
        "Fire": 2,
        "Water": 1,
        "Grass": 0.5,
        "Electric": 2,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 2,
        "Ground": 1,
        "Flying": 0,
        "Psychic": 1,
        "Bug": 0.5,
        "Rock": 2,
        "Ghost": 1,
        "Dragon": 1,
        "Dark": 1,
        "Steel": 2,
        "Fairy": 1,
        "Crystal": 2,
    },
    "Flying": {
        "Normal": 1,
        "Fire": 1,
        "Water": 1,
        "Grass": 2,
        "Electric": 0.5,
        "Ice": 1,
        "Fighting": 2,
        "Poison": 1,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 2,
        "Rock": 0.5,
        "Ghost": 1,
        "Dragon": 1,
        "Dark": 1,
        "Steel": 0.5,
        "Fairy": 1,
        "Crystal": 0.5,
    },
    "Psychic": {
        "Normal": 1,
        "Fire": 1,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 2,
        "Poison": 2,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 0.5,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 1,
        "Dragon": 1,
        "Dark": 0,
        "Steel": 0.5,
        "Fairy": 1,
        "Crystal": 0.5,
    },
    "Bug": {
        "Normal": 1,
        "Fire": 0.5,
        "Water": 1,
        "Grass": 2,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 0.5,
        "Poison": 0.5,
        "Ground": 1,
        "Flying": 0.5,
        "Psychic": 2,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 0.5,
        "Dragon": 1,
        "Dark": 2,
        "Steel": 0.5,
        "Fairy": 0.5,
        "Crystal": 1,
    },
    "Rock": {
        "Normal": 1,
        "Fire": 2,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 2,
        "Fighting": 0.5,
        "Poison": 1,
        "Ground": 0.5,
        "Flying": 2,
        "Psychic": 1,
        "Bug": 2,
        "Rock": 1,
        "Ghost": 1,
        "Dragon": 1,
        "Dark": 1,
        "Steel": 0.5,
        "Fairy": 1,
        "Crystal": 0.5,
    },
    "Ghost": {
        "Normal": 0,
        "Fire": 1,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 2,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 2,
        "Dragon": 1,
        "Dark": 0.5,
        "Steel": 1,
        "Fairy": 1,
        "Crystal": 1,
    },
    "Dragon": {
        "Normal": 1,
        "Fire": 1,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 1,
        "Dragon": 2,
        "Dark": 1,
        "Steel": 0.5,
        "Fairy": 0,
        "Crystal": 0.5,
    },
    "Dark": {
        "Normal": 1,
        "Fire": 1,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 0.5,
        "Poison": 1,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 2,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 2,
        "Dragon": 1,
        "Dark": 0.5,
        "Steel": 1,
        "Fairy": 0.5,
        "Crystal": 1,
    },
    "Steel": {
        "Normal": 1,
        "Fire": 0.5,
        "Water": 0.5,
        "Grass": 1,
        "Electric": 0.5,
        "Ice": 2,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 2,
        "Ghost": 1,
        "Dragon": 1,
        "Dark": 1,
        "Steel": 0.5,
        "Fairy": 2,
        "Crystal": 2,
    },
    "Fairy": {
        "Normal": 1,
        "Fire": 0.5,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 2,
        "Poison": 0.5,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 1,
        "Dragon": 2,
        "Dark": 2,
        "Steel": 0.5,
        "Fairy": 1,
        "Crystal": 1,
    },
    "Crystal": {
        "Normal": 1,
        "Fire": 1,
        "Water": 1,
        "Grass": 1,
        "Electric": 1,
        "Ice": 1,
        "Fighting": 1,
        "Poison": 1,
        "Ground": 1,
        "Flying": 1,
        "Psychic": 1,
        "Bug": 1,
        "Rock": 1,
        "Ghost": 1,
        "Dragon": 1,
        "Dark": 1,
        "Steel": 1,
        "Fairy": 1,
        "Crystal": 1,
    },
}


def normalize_type(type_name):
    return (
        type_name.lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ã", "a")
        .replace("â", "a")
        .replace("ç", "c")
    )


def get_english_type(type_name: str) -> Optional[str]:
    normalized = normalize_type(type_name).strip()
    return TYPE_ALIASES.get(normalized, None)


def find_ball_by_type(pokemon_type: str) -> Tuple[Optional[str], Optional[str]]:
    normalized = normalize_type(pokemon_type).strip()
    if normalized in TYPE_TO_BALL:
        return TYPE_TO_BALL[normalized], TYPE_ALIASES.get(normalized, pokemon_type)
    return None, None


def parse_defense_types(pokemon_type: str) -> Optional[List[str]]:
    type_tokens = [
        token.strip()
        for token in pokemon_type.replace("/", ",").split(",")
        if token.strip()
    ]
    types: List[str] = []
    for token in type_tokens:
        normalized_type = get_english_type(token)
        if normalized_type is None:
            return None
        types.append(normalized_type)

    if len(types) == 0 or len(types) > 2:
        return None
    return types


def classify_effectiveness(mult):
    if mult == 0:
        return "None"
    if mult >= 2:
        return "Super Effective"
    if mult > 1:
        return "Effective"
    if mult == 1:
        return "Normal"
    if mult >= 0.5:
        return "Ineffective"
    return "Very Ineffective"


def print_type_effectiveness():
    print("\n===================================================")
    print("              EFFECTIVENESS")
    print("===================================================\n")
    pokemon_type = input(
        "\n\tEnter the Pokemon type (one or two types separated by '/' or ', '): "
    ).strip()
    defense_types = parse_defense_types(pokemon_type)

    if defense_types is None:
        print(
            "\nInvalid type. Enter one or two valid types in Portuguese or English.\n"
        )
        return

    assert defense_types is not None

    results = []
    for attack_type, table in TYPE_EFFECTIVENESS.items():
        multiplier = 1
        for defense in defense_types:
            multiplier *= table[defense]
        results.append((attack_type, multiplier, classify_effectiveness(multiplier)))

    results.sort(key=lambda x: (-x[1], x[0]))
    effective_types = [
        attack_type for attack_type, multiplier, _ in results if multiplier > 1
    ]

    print("\nDefense type: " + ", ".join(defense_types) + "\n")
    if effective_types:
        print("Most effective attack types: {}\n".format(", ".join(effective_types)))
    else:
        print("No attack type is more effective against this defense type.\n")

    print("{:<12} {:<5} {}".format("Attack", "x", "Category"))
    print("-" * 36)
    for attack_type, multiplier, category in results:
        print("{:<12} {:<5} {}".format(attack_type, multiplier, category))
    print("\n===================================================\n")


def print_ball_types():
    print("\n===================================================")
    print("                 BALL TYPES")
    print("===================================================\n")
    for ball, types in BALLS_DISPLAY_TYPES.items():
        print(f"{ball}: {', '.join(types)}")
    print("\n===================================================\n")


def print_effectiveness_info():
    single = [
        ("Weak against attack", "2x", "Super Effective"),
        ("Neutral against attack", "1x", "Normal"),
        ("Resistant against attack", "0.5x", "Very Ineffective"),
        ("No effect against attack (PVE)", "0x", "None"),
        ("No effect against attack (PVE Nightmare World)", "0.5x", "Very Ineffective"),
        ("No effect against attack (PVP)", "0.4x", "-"),
    ]
    dual = [
        ("Both weak against attack", "2x", "Super Effective"),
        ("One weak against attack", "1.75x", "Effective"),
        ("One weak and one resistant against attack", "1x", "Normal"),
        ("Both neutral against attack", "1x", "Normal"),
        ("One resistant and one neutral against attack", "0.75x", "Ineffective"),
        ("Both resistant against attack", "0.5x", "Very Ineffective"),
        ("One no effect against attack (PVE)", "0x", "None"),
        (
            "One no effect against attack (PVE Nightmare World)",
            "0.5x",
            "Very Ineffective",
        ),
        ("One no effect against attack (PVP)", "0.4x", "-"),
    ]

    print("\n===================================================")
    print("                 EFFECTIVENESS")
    print("===================================================\n")
    print("Element Effectiveness (Single Type):\n")
    print(f"{'Situation':<52} {'Multiplier':<14} {'Description'}")
    print("-" * 84)
    for situation, mult, desc in single:
        print(f"{situation:<52} {mult:<14} {desc}")
    print("\nElement Effectiveness (Dual Type):\n")
    print(f"{'Situation':<52} {'Multiplier':<14} {'Description'}")
    print("-" * 84)
    for situation, mult, desc in dual:
        print(f"{situation:<52} {mult:<14} {desc}")
    print("\n===================================================\n")


# =========================================================
# BOOST CALCULATOR
# =========================================================


def use_common_stone(required_stones, stone_price, boost_stone_price):
    if boost_stone_price <= 0:
        return True

    return (required_stones * stone_price) < boost_stone_price


def normalize_price(price):
    if price > 1000:
        return price / 1000

    return price


def format_number(number):
    return f"{number:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def format_cost(cost):
    if cost >= 1000:
        return f"{format_number(cost / 1000)} KK"

    if cost > 0:
        return f"{round(cost)} K"

    return "0 K"


def calculate_normal_boost(
    current_boost, target_boost, boost_type, stone_price, boost_stone_price
):
    common_stones = 0
    boost_stones = 0
    boost_stone_levels = []
    stones_per_boost = 0

    for level in range(0, current_boost + 1):
        if level % boost_type == 0:
            stones_per_boost += 1

    for level in range(current_boost + 1, target_boost + 1):
        if use_common_stone(stones_per_boost, stone_price, boost_stone_price):
            common_stones += stones_per_boost
        else:
            boost_stones += 1
            boost_stone_levels.append(level)

        if level % boost_type == 0 and level != current_boost:
            stones_per_boost += 1

    return common_stones, boost_stones, boost_stone_levels


def calculate_special_boost(
    current_boost, target_boost, boost_type, stone_price, boost_stone_price
):
    common_stones = 0
    boost_stones = 0
    boost_stone_levels = []
    stones_per_boost = 1

    for level in range(1, current_boost + 1):
        if level < 10:
            continue

        if level % boost_type == 0:
            stones_per_boost += 1

    for level in range(current_boost + 1, target_boost + 1):
        if level < 10:
            if level % 2 != 0:
                continue

            if use_common_stone(stones_per_boost, stone_price, boost_stone_price):
                common_stones += stones_per_boost
            else:
                boost_stones += 1
                boost_stone_levels.append(level)

            continue

        if use_common_stone(stones_per_boost, stone_price, boost_stone_price):
            common_stones += stones_per_boost
        else:
            boost_stones += 1
            boost_stone_levels.append(level)

        if level % boost_type == 0:
            stones_per_boost += 1

    return common_stones, boost_stones, boost_stone_levels


def boost_table_key(boost_type, use_special):
    if boost_type in ["30", "50"] and use_special == "1":
        return f"{boost_type}_special"

    return boost_type


def print_boost_table(table_key):
    table = boost_tables[table_key]

    print("\n===================================================")
    print("                 BOOST TABLE")
    print("===================================================\n")

    for level in range(1, 51):
        print(f"+{level:02d}: {table[level]} stones")

    print("\n===================================================\n")


def query_boost_table():
    available_boosts = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "15",
        "20",
        "25",
        "30",
        "50",
    ]

    print("\n===================================================")
    print("              BOOST TABLE LOOKUP")
    print("===================================================\n")

    print("Available boosts:")
    print(", ".join(available_boosts))

    boost_type = input("\nEnter the boost type: ")
    use_special = input(
        "\nAre you using Ancient, Metal, or Crystal Stone?\n"
        "1 - Yes\n"
        "2 - No\n\n"
        "Choice: "
    )

    table_key = boost_table_key(boost_type, use_special)

    if table_key not in boost_tables:
        print("\nInvalid boost or no official special table available.\n")
        return

    print_boost_table(table_key)

    level = input("Enter a level to check, or press ENTER to return: ")

    if not level:
        return

    level = int(level)

    if level < 1 or level > 50:
        print("\nLevel must be between +1 and +50.\n")
        return

    print(f"\nBoost +{level}: {boost_tables[table_key][level]} stones\n")


def boost_calculator():

    print("\n===================================================")
    print("               BOOST CALCULATOR")
    print("===================================================\n")

    available_boosts = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "15",
        "20",
        "25",
        "30",
        "50",
    ]

    print("Available boosts:")
    print(", ".join(available_boosts))

    boost_type = input("\nEnter the boost type: ")

    use_special = input(
        "\nAre you using Ancient, Metal, or Crystal Stone?\n"
        "1 - Yes\n"
        "2 - No\n\n"
        "Choice: "
    )

    current_boost = int(input("\nEnter current boost: "))
    target_boost = int(input("Enter desired boost: "))

    stone_price = normalize_price(float(input("\nEnter the stone price: ")))
    boost_stone_price = normalize_price(float(input("Enter the Boost Stone price: ")))

    if boost_type not in boost_tables:
        print("\nInvalid boost.\n")
        return

    if current_boost < 0 or target_boost > 50:
        print("\nBoost must be between +0 and +50.\n")
        return

    if current_boost > target_boost:
        print("\nCurrent boost cannot be higher than desired boost.\n")
        return

    if current_boost == target_boost:
        common_stones = 0
        boost_stones = 0
        boost_stone_levels = []
    elif use_special == "1":
        common_stones, boost_stones, boost_stone_levels = calculate_special_boost(
            current_boost,
            target_boost,
            int(boost_type),
            stone_price,
            boost_stone_price,
        )
    else:
        common_stones, boost_stones, boost_stone_levels = calculate_normal_boost(
            current_boost,
            target_boost,
            int(boost_type),
            stone_price,
            boost_stone_price,
        )

    total_stone_cost = common_stones * stone_price
    total_boost_cost = boost_stones * boost_stone_price
    total_cost = total_stone_cost + total_boost_cost

    print("\n===================================================")
    print("                    RESULT")
    print("===================================================\n")

    print(f"Current boost: +{current_boost}")
    print(f"Desired boost: +{target_boost}\n")

    print(f"Common stones used: {common_stones}")
    print(f"Boost Stones used: {boost_stones}")

    if boost_stones > 0:
        boost_levels_text = ", ".join([f"+{x}" for x in boost_stone_levels])
        print(f"Boosts done with Boost Stone: {boost_levels_text}")

    print("\n---------------------------------------------------")

    print(f"Common stone cost: {format_cost(total_stone_cost)}")
    print(f"Boost Stone cost: {format_cost(total_boost_cost)}")

    print(f"\nTOTAL COST: {format_cost(total_cost)}")

    print("\n===================================================\n")


# =========================================================
# MAIN MENU
# =========================================================


def menu():

    while True:

        print(f"\nHello! Choose an option to continue:\n")

        print(
            "\t1 - Lucky Drop Chance\n"
            "\t2 - Average Balls\n"
            "\t3 - Ball Types\n"
            "\t4 - Boost Calculator\n"
            "\t5 - Effectiveness\n"
            "\t6 - Boost Table\n"
            "\t0 - Exit\n"
        )

        selected_option = input("\tEnter an option: ")

        # =================================================
        # 1 - Lucky
        # =================================================

        if selected_option == "1":

            elixir = str(input("\n \t Enter 1 for Elixir or 2 for No Elixir: "))

            drop_percentage = float(input("\n \tEnter the drop percentage: "))

            print("\n----------------------------------------------------------")

            luckys = [0.1, 0.2, 0.35, 0.5, 0.8, 1.0, 1.5]

            elixir_p = 0.2
            elixir_g = 0.8

            if elixir == "1":

                for l, mult in enumerate(luckys, start=1):

                    print(f"Lucky {l}: " f"{round(drop_percentage * (1 + mult), 2)}")

                    print(
                        f"Lucky {l} +20%: "
                        f"{round(drop_percentage * (1 + (mult + elixir_p)), 2)}"
                    )

                    print(
                        f"Lucky {l} +80%: "
                        f"{round(drop_percentage * (1 + (mult + elixir_g)), 2)}\n"
                    )

                    print("----------------------------------------------------------")

            else:

                for l, mult in enumerate(luckys, start=1):

                    print(f"Lucky {l}: " f"{round(drop_percentage * (1 + mult), 2)}\n")

        # =================================================
        # 2 - Average Balls
        # =================================================

        elif selected_option == "2":

            elemental = 250
            ub = 130

            npc_price = int(input("\n\tEnter the NPC price of the Pokémon: "))

            pokemon_type = input(
                "\n\tEnter the Pokémon type (ex: Fire, Fogo, Water, Agua): "
            ).strip()

            chosen_ball, detected_type = find_ball_by_type(pokemon_type)

            if not chosen_ball:
                chosen_ball = "Ball Elemental"
                detected_type = pokemon_type

            pokeball_price = int(input(f"\n\tEnter the price of {chosen_ball}: "))

            elemental_average = 2 * (npc_price / elemental)
            ub_average = 2 * (npc_price / ub)

            print(
                f"You will need approximately "
                f"{math.ceil(ub_average)} UB/PB "
                f"(${math.ceil((ub_average * ub) / 1000)}k) "
                f"or "
                f"{math.ceil(elemental_average)} {chosen_ball} (type: {detected_type}) "
                f"(${math.ceil((elemental_average * pokeball_price) / 1000)}k)\n"
            )

            print("\n----------------------------------------------------------")

        # =================================================
        # 3 - Ball Types
        # =================================================

        elif selected_option == "3":

            print_ball_types()

        # =================================================
        # 4 - Boost Calculator
        # =================================================

        elif selected_option == "4":

            boost_calculator()

        # =================================================
        # 5 - Effectiveness
        # =================================================

        elif selected_option == "5":

            print_type_effectiveness()

        # =================================================
        # 6 - Boost Table
        # =================================================

        elif selected_option == "6":

            query_boost_table()

        # =================================================
        # 0 - Exit
        # =================================================

        elif selected_option == "0":

            print("Exiting program.\n")
            break

        # =================================================
        # Invalid Option
        # =================================================

        else:

            print("Invalid option, returning to main menu\n")


if __name__ == "__main__":
    menu()
