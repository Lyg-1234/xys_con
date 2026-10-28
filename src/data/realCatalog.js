/**
 * 真实片单数据（由 tools/gen-catalog.mjs 从 Internet Archive 公有领域影片库抓取生成）
 * 每一条都对应一部真实存在的影片/剧集，播放地址与时长均来自片源元数据，
 * 因此「片名 = 实际播放内容」，且电影为完整长片、剧集为完整分集。
 *
 * 若你有自有 / 正版片源，可在 videos.js 的 CUSTOM_SOURCES 中按 id 覆盖。
 */
export const REAL_CATALOG = [
  {
    "t": "tv",
    "title": "大淘金",
    "original": "Bonanza",
    "y": 1960,
    "region": "美国",
    "g": [
      "西部",
      "家庭",
      "剧情"
    ],
    "s": 8.9,
    "hot": 9960,
    "vip": true,
    "badge": "经典",
    "c": [
      "#6b3f1d",
      "#d9a441"
    ],
    "e": "🐎",
    "desc": "美国 NBC 长寿西部剧集，卡特赖特父子在内华达州蓬德罗萨牧场上经营家园，也一次次卷入淘金热潮、土地纷争与小镇恩怨之中。",
    "director": "David Dortort",
    "cast": [
      [
        "Lorne Greene",
        "Ben Cartwright"
      ],
      [
        "Michael Landon",
        "Little Joe"
      ],
      [
        "Dan Blocker",
        "Hoss"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1集",
        "duration": 2957,
        "srcs": [
          "https://archive.org/download/Bonanza_-_The_Trail_Gang/Bonanza_-_The_Trail_Gang.mp4",
          "https://archive.org/download/Bonanza_-_The_Trail_Gang/Bonanza_-_The_Trail_Gang_512kb.mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2集",
        "duration": 2966,
        "srcs": [
          "https://archive.org/download/Bonanza_-_Day_Of_Reckoning/Bonanza_-_Day_Of_Reckoning.mp4",
          "https://archive.org/download/Bonanza_-_Day_Of_Reckoning/Bonanza_-_Day_Of_Reckoning_512kb.mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3集",
        "duration": 2964,
        "srcs": [
          "https://archive.org/download/Bonanza-BitterWater/Bonanza_Bitter_Water_S01-E29.mp4",
          "https://archive.org/download/Bonanza-BitterWater/Bonanza_Bitter_Water_S01-E29_512kb.mp4"
        ]
      },
      {
        "no": 4,
        "title": "第4集",
        "duration": 2939,
        "srcs": [
          "https://archive.org/download/Bonanza-TheFearMerchants/Bonanza_-_The_Fear_Merchants_S01-E20.mp4",
          "https://archive.org/download/Bonanza-TheFearMerchants/Bonanza_-_The_Fear_Merchants_S01-E20_512kb.mp4"
        ]
      },
      {
        "no": 5,
        "title": "第5集",
        "duration": 2964,
        "srcs": [
          "https://archive.org/download/Bonanza_-_The_Spitfire/Bonanza_-_The_Spitfire.mp4",
          "https://archive.org/download/Bonanza_-_The_Spitfire/Bonanza_-_The_Spitfire_512kb.mp4"
        ]
      },
      {
        "no": 6,
        "title": "第6集",
        "duration": 2964,
        "srcs": [
          "https://archive.org/download/Bonanza-TheStranger/Bonanza_-_The_Stranger_S01-E24.mp4",
          "https://archive.org/download/Bonanza-TheStranger/Bonanza_-_The_Stranger_S01-E24_512kb.mp4"
        ]
      },
      {
        "no": 7,
        "title": "第7集",
        "duration": 2961,
        "srcs": [
          "https://archive.org/download/Bonanza_-_Silent_Thunder/Bonanza_-_Silent_Thunder.mp4",
          "https://archive.org/download/Bonanza_-_Silent_Thunder/Bonanza_-_Silent_Thunder_512kb.mp4"
        ]
      },
      {
        "no": 8,
        "title": "第8集",
        "duration": 2964,
        "srcs": [
          "https://archive.org/download/Bonanza_-_The_Savage/Bonanza_-_The_Savage.mp4",
          "https://archive.org/download/Bonanza_-_The_Savage/Bonanza_-_The_Savage_512kb.mp4"
        ]
      },
      {
        "no": 9,
        "title": "第9集",
        "duration": 2963,
        "srcs": [
          "https://archive.org/download/Bonanza-BloodOnTheLand/Bonanza_-_Blood_On_The_Land_S01-E22.mp4",
          "https://archive.org/download/Bonanza-BloodOnTheLand/Bonanza_-_Blood_On_The_Land_S01-E22_512kb.mp4"
        ]
      },
      {
        "no": 10,
        "title": "第10集",
        "duration": 2961,
        "srcs": [
          "https://archive.org/download/Bonanza_-_The_Courtship/Bonanza_-_The_Courtship.mp4",
          "https://archive.org/download/Bonanza_-_The_Courtship/Bonanza_-_The_Courtship_512kb.mp4"
        ]
      },
      {
        "no": 11,
        "title": "第11集",
        "duration": 2963,
        "srcs": [
          "https://archive.org/download/Bonanza_The_Mill/Bonanza_The_Mill.mp4",
          "https://archive.org/download/Bonanza_The_Mill/Bonanza_The_Mill_512kb.mp4"
        ]
      },
      {
        "no": 12,
        "title": "第12集",
        "duration": 2978,
        "srcs": [
          "https://archive.org/download/Bonanza_-_The_Blood_Line/Bonanza_-_The_Blood_Line.mp4",
          "https://archive.org/download/Bonanza_-_The_Blood_Line/Bonanza_-_The_Blood_Line_512kb.mp4"
        ]
      },
      {
        "no": 13,
        "title": "第13集",
        "duration": 2965,
        "srcs": [
          "https://archive.org/download/Bonanza-EscapeToPonderosa/Bonanza_-_Escape_To_Ponderosa_S01-E25.mp4",
          "https://archive.org/download/Bonanza-EscapeToPonderosa/Bonanza_-_Escape_To_Ponderosa_S01-E25_512kb.mp4"
        ]
      },
      {
        "no": 14,
        "title": "第14集",
        "duration": 2966,
        "srcs": [
          "https://archive.org/download/Bonanza-TheAvenger/Bonanza_-_The_Avenger_S01-E26.mp4",
          "https://archive.org/download/Bonanza-TheAvenger/Bonanza_-_The_Avenger_S01-E26_512kb.mp4"
        ]
      },
      {
        "no": 15,
        "title": "第15集",
        "duration": 2982,
        "srcs": [
          "https://archive.org/download/Bonanza_-_Denver_McKee/Bonanza_-_Denver_McKee.mp4",
          "https://archive.org/download/Bonanza_-_Denver_McKee/Bonanza_-_Denver_McKee_512kb.mp4"
        ]
      },
      {
        "no": 16,
        "title": "第16集",
        "duration": 2955,
        "srcs": [
          "https://archive.org/download/Bonanza-TheLastTrophy/Bonanza_The_Last_Trophy_S01-E27.mp4",
          "https://archive.org/download/Bonanza-TheLastTrophy/Bonanza_The_Last_Trophy_S01-E27_512kb.mp4"
        ]
      },
      {
        "no": 17,
        "title": "第17集",
        "duration": 2964,
        "srcs": [
          "https://archive.org/download/Bonanza-FeetOfClay/Bonanza_-_Feet_Of_Clay_S01-E30.mp4",
          "https://archive.org/download/Bonanza-FeetOfClay/Bonanza_-_Feet_Of_Clay_S01-E30_512kb.mp4"
        ]
      },
      {
        "no": 18,
        "title": "第18集",
        "duration": 2964,
        "srcs": [
          "https://archive.org/download/Bonanza_-_The_Hopefuls/Bonanza_-_The_Hopefuls.mp4",
          "https://archive.org/download/Bonanza_-_The_Hopefuls/Bonanza_-_The_Hopefuls_512kb.mp4"
        ]
      },
      {
        "no": 19,
        "title": "第19集",
        "duration": 2962,
        "srcs": [
          "https://archive.org/download/Bonanza-DarkStar/Bonanza_-_Dark_Star_S01-E31.mp4",
          "https://archive.org/download/Bonanza-DarkStar/Bonanza_-_Dark_Star_S01-E31_512kb.mp4"
        ]
      },
      {
        "no": 20,
        "title": "第20集",
        "duration": 2966,
        "srcs": [
          "https://archive.org/download/Bonanza-SanFrancisco/Bonanza_-_San_Francisco_S01-E28.mp4",
          "https://archive.org/download/Bonanza-SanFrancisco/Bonanza_-_San_Francisco_S01-E28_512kb.mp4"
        ]
      }
    ]
  },
  {
    "t": "tv",
    "title": "飓风快车",
    "original": "The Hurricane Express",
    "y": 1932,
    "region": "美国",
    "g": [
      "动作",
      "冒险",
      "悬疑"
    ],
    "s": 8.2,
    "hot": 9120,
    "vip": false,
    "badge": "全集",
    "c": [
      "#1f3c88",
      "#f0a202"
    ],
    "e": "🚂",
    "desc": "1932 年环球影业经典连本剧，共 12 集。铁路线上接连发生神秘事故，年轻的飞行员与铁路公司继承人一同追查幕后黑手。",
    "director": "J.P. McGowan / Armand Schaefer",
    "cast": [
      [
        "John Wayne",
        "Larry Baker"
      ],
      [
        "Shirley Grey",
        "Gloria"
      ],
      [
        "Conway Tearle",
        "Stevens"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1集",
        "duration": 1711,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-01/The%20Hurricane%20Express%2001.mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2集",
        "duration": 985,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-02/The%20Hurricane%20Express%2002.mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3集",
        "duration": 1031,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-03/The%20Hurricane%20Express%2003.mp4"
        ]
      },
      {
        "no": 4,
        "title": "第4集",
        "duration": 1167,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-04/The%20Hurricane%20Express%2004.mp4"
        ]
      },
      {
        "no": 5,
        "title": "第5集",
        "duration": 1015,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-05/The%20Hurricane%20Express%2005.mp4"
        ]
      },
      {
        "no": 6,
        "title": "第6集",
        "duration": 1191,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-06/The%20Hurricane%20Express%2006.mp4"
        ]
      },
      {
        "no": 7,
        "title": "第7集",
        "duration": 1099,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-07/The%20Hurricane%20Express%2007.mp4"
        ]
      },
      {
        "no": 8,
        "title": "第8集",
        "duration": 1147,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-08/The%20Hurricane%20Express%2008.mp4"
        ]
      },
      {
        "no": 9,
        "title": "第9集",
        "duration": 1116,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-09/The%20Hurricane%20Express%2009.mp4"
        ]
      },
      {
        "no": 10,
        "title": "第10集",
        "duration": 985,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-10/The%20Hurricane%20Express%2010.mp4"
        ]
      },
      {
        "no": 11,
        "title": "第11集",
        "duration": 1049,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-11/The%20Hurricane%20Express%2011.mp4"
        ]
      },
      {
        "no": 12,
        "title": "第12集",
        "duration": 1065,
        "srcs": [
          "https://archive.org/download/the-hurricane-express-12/The%20Hurricane%20Express%2012.mp4"
        ]
      }
    ]
  },
  {
    "t": "tv",
    "title": "昌杜归来",
    "original": "The Return of Chandu",
    "y": 1934,
    "region": "美国",
    "g": [
      "奇幻",
      "冒险"
    ],
    "s": 8,
    "hot": 8840,
    "vip": false,
    "badge": "全集",
    "c": [
      "#3a0ca3",
      "#4cc9f0"
    ],
    "e": "🔮",
    "desc": "1934 年 12 集连本剧。拥有东方秘术的昌杜为保护公主，与觊觎圣物的黑暗势力在异域古国展开较量。",
    "director": "Ray Taylor",
    "cast": [
      [
        "Bela Lugosi",
        "Chandu"
      ],
      [
        "Maria Alba",
        "Princess Nadji"
      ],
      [
        "Clara Kimball Young",
        "Dorothy"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1集",
        "duration": 1001,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-01/The%20Return%20Of%20Chandu%2001.mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2集",
        "duration": 1164,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-02/The%20Return%20Of%20Chandu%2002.mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3集",
        "duration": 1019,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-03/The%20Return%20Of%20Chandu%2003.mp4"
        ]
      },
      {
        "no": 4,
        "title": "第4集",
        "duration": 1209,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-04/The%20Return%20Of%20Chandu%2004.mp4"
        ]
      },
      {
        "no": 5,
        "title": "第5集",
        "duration": 974,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-05/The%20Return%20Of%20Chandu%2005.mp4"
        ]
      },
      {
        "no": 6,
        "title": "第6集",
        "duration": 999,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-06/The%20Return%20Of%20Chandu%2006.mp4"
        ]
      },
      {
        "no": 7,
        "title": "第7集",
        "duration": 1038,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-07/The%20Return%20Of%20Chandu%2007.mp4"
        ]
      },
      {
        "no": 8,
        "title": "第8集",
        "duration": 949,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-08/The%20Return%20Of%20Chandu%2008.mp4"
        ]
      },
      {
        "no": 9,
        "title": "第9集",
        "duration": 982,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-09/The%20Return%20Of%20Chandu%2009.mp4"
        ]
      },
      {
        "no": 10,
        "title": "第10集",
        "duration": 1205,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-10/The%20Return%20Of%20Chandu%2010.mp4"
        ]
      },
      {
        "no": 11,
        "title": "第11集",
        "duration": 1006,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-11/The%20Return%20Of%20Chandu%2011.mp4"
        ]
      },
      {
        "no": 12,
        "title": "第12集",
        "duration": 1101,
        "srcs": [
          "https://archive.org/download/the-return-of-chandu-12/The%20Return%20Of%20Chandu%2012.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "诺斯费拉图",
    "original": "Nosferatu (1922)",
    "y": 1922,
    "region": "德国",
    "g": [
      "恐怖",
      "经典"
    ],
    "s": 8.8,
    "hot": 9610,
    "vip": true,
    "badge": "经典",
    "c": [
      "#1b1b1b",
      "#8e0e00"
    ],
    "e": "🦇",
    "desc": "茂瑙执导的德国表现主义默片，影史上第一部吸血鬼题材长片，奥洛克伯爵的造型至今仍是恐怖片的灵感源头。",
    "director": "F.W. Murnau",
    "cast": [
      [
        "Max Schreck",
        "奥洛克伯爵"
      ],
      [
        "Greta Schröder",
        "艾伦"
      ],
      [
        "Gustav von Wangenheim",
        "托马斯"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 5514,
        "srcs": [
          "https://archive.org/download/Nosferatu1922/Nosferatu-smaller2.mp4",
          "https://archive.org/download/Nosferatu1922/Nosferatu.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "大都会",
    "original": "Metropolis (1927)",
    "y": 1927,
    "region": "德国",
    "g": [
      "科幻",
      "经典"
    ],
    "s": 9,
    "hot": 9780,
    "vip": true,
    "badge": "经典",
    "c": [
      "#0f2027",
      "#5f6caf"
    ],
    "e": "🏙",
    "desc": "弗里茨·朗的科幻奠基之作：未来都市被分为地上与地下两个世界，机器与人性的冲突在这里第一次被搬上银幕。",
    "director": "Fritz Lang",
    "cast": [
      [
        "Brigitte Helm",
        "玛利亚 / 机器人"
      ],
      [
        "Alfred Abel",
        "弗雷德森"
      ],
      [
        "Gustav Fröhlich",
        "弗雷德"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 7118,
        "srcs": [
          "https://archive.org/download/Metropolis1927EnglishVersion/Metropolis_1927_English_Version.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "活死人之夜",
    "original": "Night of the Living Dead (1968)",
    "y": 1968,
    "region": "美国",
    "g": [
      "恐怖",
      "惊悚"
    ],
    "s": 8.6,
    "hot": 9480,
    "vip": true,
    "badge": "",
    "c": [
      "#232526",
      "#7a2828"
    ],
    "e": "🧟",
    "desc": "乔治·A·罗梅罗的丧尸片开山之作。七个陌生人被困在乡间农舍，面对门外越来越多不知疲倦的「它们」。",
    "director": "George A. Romero",
    "cast": [
      [
        "Duane Jones",
        "本"
      ],
      [
        "Judith O'Dea",
        "芭芭拉"
      ],
      [
        "Karl Hardman",
        "哈里"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 5753,
        "srcs": [
          "https://archive.org/download/Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead.mp4",
          "https://archive.org/download/Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead_1080p.mp4",
          "https://archive.org/download/Night.Of.The.Living.Dead_1080p/NightOfTheLivingDead_1080p_512kb.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "外太空九号计划",
    "original": "Plan 9 from Outer Space (1959)",
    "y": 1959,
    "region": "美国",
    "g": [
      "科幻",
      "邪典"
    ],
    "s": 7.4,
    "hot": 8720,
    "vip": false,
    "badge": "邪典",
    "c": [
      "#141e30",
      "#f3904f"
    ],
    "e": "🛸",
    "desc": "艾德·伍德执导的邪典名片，外星人计划复活地球死者——以极低成本与奇特想象成为影史最具话题的「烂片经典」。",
    "director": "Ed Wood",
    "cast": [
      [
        "Bela Lugosi",
        "吸血鬼"
      ],
      [
        "Gregory Walcott",
        "杰夫"
      ],
      [
        "Maila Nurmi",
        "吸血鬼女"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4824,
        "srcs": [
          "https://archive.org/download/774-plan-9-from-outer-space/774-Plan9FromOuterSpace.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "灵魂狂欢节",
    "original": "Carnival of Souls (1962)",
    "y": 1962,
    "region": "美国",
    "g": [
      "悬疑",
      "恐怖"
    ],
    "s": 8.3,
    "hot": 8610,
    "vip": false,
    "badge": "",
    "c": [
      "#2c3e50",
      "#e0a96d"
    ],
    "e": "🎡",
    "desc": "一场车祸之后，唯一的幸存者被一座废弃游乐园反复召唤。低成本心理恐怖片的氛围教科书。",
    "director": "Herk Harvey",
    "cast": [
      [
        "Candace Hilligoss",
        "玛丽"
      ],
      [
        "Frances Feist",
        "露丝"
      ],
      [
        "Sidney Berger",
        "约翰"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4980,
        "srcs": [
          "https://archive.org/download/CarnivalofSouls/CarnivalOfSouls.mp4",
          "https://archive.org/download/CarnivalofSouls/CarnivalOfSouls_512kb.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "绕道",
    "original": "Detour (1945)",
    "y": 1945,
    "region": "美国",
    "g": [
      "黑色电影",
      "悬疑"
    ],
    "s": 8.1,
    "hot": 8450,
    "vip": false,
    "badge": "",
    "c": [
      "#3a3a3a",
      "#b08d57"
    ],
    "e": "🛣",
    "desc": "黑色电影代表作：一名搭便车的钢琴师在公路上被卷进一场无法回头的命运，越想解释越像谎言。",
    "director": "Edgar G. Ulmer",
    "cast": [
      [
        "Tom Neal",
        "阿尔"
      ],
      [
        "Ann Savage",
        "薇拉"
      ],
      [
        "Claudia Drake",
        "苏"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4076,
        "srcs": [
          "https://archive.org/download/Detour_movie/Detour.mp4",
          "https://archive.org/download/Detour_movie/Detour_512kb.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "地球最后一人",
    "original": "The Last Man on Earth (1964)",
    "y": 1964,
    "region": "美国",
    "g": [
      "科幻",
      "恐怖"
    ],
    "s": 8.2,
    "hot": 8790,
    "vip": true,
    "badge": "",
    "c": [
      "#0b0b2b",
      "#5f0a87"
    ],
    "e": "🌫",
    "desc": "文森特·普莱斯主演的末世科幻片，也是《我是传奇》的第一次银幕改编：地球上只剩他一个人，而夜晚并不属于他。",
    "director": "Ubaldo Ragona",
    "cast": [
      [
        "Vincent Price",
        "摩根博士"
      ],
      [
        "Franca Bettoia",
        "露丝"
      ],
      [
        "Emma Danieli",
        "弗吉尼亚"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 5207,
        "srcs": [
          "https://archive.org/download/TheLastManOnEarthHD/The%20Last%20Man%20on%20Earth%20HD.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "恐怖小店",
    "original": "The Little Shop of Horrors (1960)",
    "y": 1960,
    "region": "美国",
    "g": [
      "喜剧",
      "恐怖"
    ],
    "s": 8,
    "hot": 8380,
    "vip": false,
    "badge": "",
    "c": [
      "#2d6a4f",
      "#d8f3dc"
    ],
    "e": "🪴",
    "desc": "罗杰·科曼只用两天拍完的邪典喜剧：花店小伙养了一株会说话、要吃人的植物。",
    "director": "Roger Corman",
    "cast": [
      [
        "Jonathan Haze",
        "西摩"
      ],
      [
        "Jack Nicholson",
        "威尔伯"
      ],
      [
        "Jackie Joseph",
        "奥黛丽"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4351,
        "srcs": [
          "https://archive.org/download/Little_ShopOf_Horrors.avi/The_Little_Shop_of_Horrors.mp4",
          "https://archive.org/download/Little_ShopOf_Horrors.avi/The_Little_Shop_of_Horrors_512kb.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "猛鬼屋",
    "original": "House on Haunted Hill (1959)",
    "y": 1959,
    "region": "美国",
    "g": [
      "恐怖",
      "悬疑"
    ],
    "s": 8.1,
    "hot": 8520,
    "vip": true,
    "badge": "",
    "c": [
      "#1d1e2c",
      "#7b2cbf"
    ],
    "e": "🏚",
    "desc": "威廉·卡斯尔执导的鬼屋经典：五个人在一栋闹鬼宅邸里过夜，奖金一万美元，前提是能活到天亮。",
    "director": "William Castle",
    "cast": [
      [
        "Vincent Price",
        "弗雷德里克"
      ],
      [
        "Carol Ohmart",
        "安娜贝尔"
      ],
      [
        "Richard Long",
        "兰斯"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4483,
        "srcs": [
          "https://archive.org/download/house_on_haunted_hill_ipod/house_on_haunted_hill.mp4",
          "https://archive.org/download/house_on_haunted_hill_ipod/house_on_haunted_hill_512kb.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "头版新闻",
    "original": "The Front Page (1931)",
    "y": 1931,
    "region": "美国",
    "g": [
      "喜剧",
      "剧情"
    ],
    "s": 8.4,
    "hot": 8240,
    "vip": false,
    "badge": "获奖",
    "c": [
      "#403d39",
      "#e3d5b8"
    ],
    "e": "📰",
    "desc": "刘易斯·迈尔斯通执导的记者群像喜剧，讲述一名王牌记者想尽办法留住即将辞职的同事，曾获奥斯卡最佳影片提名。",
    "director": "Lewis Milestone",
    "cast": [
      [
        "Adolphe Menjou",
        "沃尔特"
      ],
      [
        "Pat O'Brien",
        "希尔德"
      ],
      [
        "Mary Brian",
        "佩吉"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 6068,
        "srcs": [
          "https://archive.org/download/front-page-the-1931/Front%20Page,%20The%20(1931).ia.mp4",
          "https://archive.org/download/front-page-the-1931/Front%20Page,%20The%20(1931).mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "唐璜",
    "original": "Don Juan (1926)",
    "y": 1926,
    "region": "美国",
    "g": [
      "爱情",
      "冒险"
    ],
    "s": 8,
    "hot": 8120,
    "vip": false,
    "badge": "",
    "c": [
      "#5c2a2a",
      "#d4a373"
    ],
    "e": "⚔️",
    "desc": "华纳兄弟首部采用 Vitaphone 配乐的长片，约翰·巴里摩尔主演的古典传奇爱情冒险大片。",
    "director": "Alan Crosland",
    "cast": [
      [
        "John Barrymore",
        "唐璜"
      ],
      [
        "Mary Astor",
        "阿德里安娜"
      ],
      [
        "Estelle Taylor",
        "卢克雷齐娅"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 6729,
        "srcs": [
          "https://archive.org/download/don-juan-1926-dvd-mkv/Don%20Juan%20(1926)%20%7Btmdb-89059%7D%20%5BDVD%5D%5BAC3%202.0%5D%5BMPEG2%5D.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "陈查理：中国戒指",
    "original": "The Chinese Ring (1947)",
    "y": 1947,
    "region": "美国",
    "g": [
      "悬疑",
      "犯罪"
    ],
    "s": 7.9,
    "hot": 7960,
    "vip": false,
    "badge": "",
    "c": [
      "#7b2d26",
      "#e9c46a"
    ],
    "e": "💍",
    "desc": "陈查理探案系列之一：一枚刻着中文的戒指牵出船上命案，探长必须在靠岸前找出凶手。",
    "director": "William Beaudine",
    "cast": [
      [
        "Roland Winters",
        "陈查理"
      ],
      [
        "Warren Douglas",
        "比尔"
      ],
      [
        "Mantan Moreland",
        "伯明翰"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4066,
        "srcs": [
          "https://archive.org/download/the-chinese-ring-1947-dvd-mkv/The%20Chinese%20Ring%20(1947)%20%7Btmdb-90010%7D%20%5BDVD%5D%5BAC3%201.0%5D%5BMPEG2%5D.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "陈查理的秘密",
    "original": "Charlie Chan's Secret (1936)",
    "y": 1936,
    "region": "美国",
    "g": [
      "悬疑",
      "犯罪"
    ],
    "s": 7.8,
    "hot": 7880,
    "vip": false,
    "badge": "",
    "c": [
      "#023047",
      "#ffb703"
    ],
    "e": "🕵️",
    "desc": "陈查理探案系列：失踪的继承人、密室里的秘密与一封迟到的电报，探长在旧金山大宅中层层抽丝剥茧。",
    "director": "Gordon Wiles",
    "cast": [
      [
        "Warner Oland",
        "陈查理"
      ],
      [
        "Rosina Lawrence",
        "爱丽丝"
      ],
      [
        "Henrietta Crosman",
        "亨丽埃塔"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4347,
        "srcs": [
          "https://archive.org/download/charlie-chans-secret-1936-dvd-mkv/Charlie%20Chans%20Secret%20(1936)%20%7Btmdb-33708%7D%20%5BDVD%5D%5BAC3%202.0%5D%5BMPEG2%5D.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "福尔摩斯与秘密武器",
    "original": "Sherlock Holmes and the Secret Weapon (1942)",
    "y": 1942,
    "region": "美国",
    "g": [
      "悬疑",
      "战争"
    ],
    "s": 8.2,
    "hot": 8460,
    "vip": false,
    "badge": "",
    "c": [
      "#212529",
      "#adb5bd"
    ],
    "e": "🔍",
    "desc": "二战背景下的福尔摩斯探案：一台新式轰炸机的瞄准仪被拆成四份藏起，福尔摩斯必须与莫里亚蒂抢时间。",
    "director": "Roy William Neill",
    "cast": [
      [
        "Basil Rathbone",
        "夏洛克·福尔摩斯"
      ],
      [
        "Nigel Bruce",
        "华生"
      ],
      [
        "Lionel Atwill",
        "莫里亚蒂"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4114,
        "srcs": [
          "https://archive.org/download/secret_weapon/secret_weapon_ipod.mp4",
          "https://archive.org/download/secret_weapon/secret_weapon_ipod_512kb.mp4",
          "https://archive.org/download/secret_weapon/sherlock_holmes_and_the_secret_weapon.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "蝙蝠",
    "original": "The Bat (1959)",
    "y": 1959,
    "region": "美国",
    "g": [
      "悬疑",
      "恐怖"
    ],
    "s": 7.7,
    "hot": 7740,
    "vip": false,
    "badge": "",
    "c": [
      "#1b1b1b",
      "#6c757d"
    ],
    "e": "🦇",
    "desc": "老宅、密室与连环盗窃案：一名绰号「蝙蝠」的神秘凶手在暴风雨之夜现身，每个人都藏着秘密。",
    "director": "Crane Wilbur",
    "cast": [
      [
        "Vincent Price",
        "马尔科姆"
      ],
      [
        "Agnes Moorehead",
        "科妮莉亚"
      ],
      [
        "Gavin Gordon",
        "弗莱明"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4615,
        "srcs": [
          "https://archive.org/download/the-bat-1959-dvd-mkv/The%20Bat%20(1959)%20%7Btmdb-35813%7D%20%7Bedition-Fullscreen%7D%20%5BDVD%5D%5BAC3%201.0%5D%5BMPEG2%5D.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "挨耳光的人",
    "original": "He Who Gets Slapped (1924)",
    "y": 1924,
    "region": "美国",
    "g": [
      "剧情",
      "经典"
    ],
    "s": 8.3,
    "hot": 8060,
    "vip": false,
    "badge": "默片",
    "c": [
      "#3c3c3c",
      "#c9ada7"
    ],
    "e": "🎭",
    "desc": "朗·钱尼主演的默片经典：一位被学术界羞辱的科学家走进马戏团，成为舞台上永远被扇耳光的小丑。",
    "director": "Victor Sjöström",
    "cast": [
      [
        "Lon Chaney",
        "保罗·博蒙特"
      ],
      [
        "Norma Shearer",
        "孔苏埃洛"
      ],
      [
        "John Gilbert",
        "贝扎诺"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 5744,
        "srcs": [
          "https://archive.org/download/he-who-gets-slapped-1924-dvd-mkv-18fps/He%20Who%20Gets%20Slapped%20(1924)%20%7Btmdb-27511%7D%20%5BDVD%5D%5BMPEG2%5D.mp4"
        ]
      }
    ]
  },
  {
    "t": "movie",
    "title": "月球旅行记",
    "original": "A Trip to the Moon (1902)",
    "y": 1902,
    "region": "法国",
    "g": [
      "科幻",
      "经典"
    ],
    "s": 8.5,
    "hot": 8180,
    "vip": false,
    "badge": "默片",
    "c": [
      "#0d1b2a",
      "#e0e1dd"
    ],
    "e": "🌙",
    "desc": "乔治·梅里爱的科幻起点：一群科学家被炮弹送上月球，遇见了月亮上的居民——电影特效的源头之一。",
    "director": "Georges Méliès",
    "cast": [
      [
        "Georges Méliès",
        "科学家"
      ],
      [
        "Victor André",
        "队长"
      ],
      [
        "Bluette Bernon",
        "月球女神"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 936,
        "srcs": [
          "https://archive.org/download/ATripToTheMoon1902/A%20Trip%20to%20the%20Moon%20(1902).mp4"
        ]
      }
    ]
  },
  {
    "t": "variety",
    "title": "三个臭皮匠",
    "original": "The Three Stooges",
    "y": 1940,
    "region": "美国",
    "g": [
      "喜剧",
      "短片"
    ],
    "s": 8.4,
    "hot": 9080,
    "vip": false,
    "badge": "经典",
    "c": [
      "#ff7b00",
      "#3a3a3a"
    ],
    "e": "🥧",
    "desc": "美式肢体喜剧的传奇组合。八部经典短片合集，打闹、误会与蛋糕大战一场接一场。",
    "director": "Del Lord 等",
    "cast": [
      [
        "Moe Howard",
        "Moe"
      ],
      [
        "Larry Fine",
        "Larry"
      ],
      [
        "Curly Howard",
        "Curly"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1期",
        "duration": 1014,
        "srcs": [
          "https://archive.org/download/3stooges/3stooges_NewApants2_512kb.mp4",
          "https://archive.org/download/3stooges/3stooges_NewApants2.mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2期",
        "duration": 994,
        "srcs": [
          "https://archive.org/download/3stooges/3stooges_NewDisorder2_512kb.mp4",
          "https://archive.org/download/3stooges/3stooges_NewDisorder2.mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3期",
        "duration": 997,
        "srcs": [
          "https://archive.org/download/3stooges/3stooges_NewGroom_512kb.mp4",
          "https://archive.org/download/3stooges/3stooges_NewGroom.mp4"
        ]
      },
      {
        "no": 4,
        "title": "第4期",
        "duration": 939,
        "srcs": [
          "https://archive.org/download/3stooges/3stooges_NewMalice1_512kb.mp4",
          "https://archive.org/download/3stooges/3stooges_NewMalice1.mp4"
        ]
      }
    ]
  },
  {
    "t": "variety",
    "title": "达斯蒂的旅程",
    "original": "Dusty's Trail",
    "y": 1973,
    "region": "美国",
    "g": [
      "情景喜剧",
      "喜剧"
    ],
    "s": 7.9,
    "hot": 7820,
    "vip": false,
    "badge": "",
    "c": [
      "#8d99ae",
      "#edf2f4"
    ],
    "e": "🚐",
    "desc": "1973 年西部公路情景喜剧：一辆掉队的马车、一群互不顺眼的同路人，一路向西笑料不断。",
    "director": "Bob Denver 主演",
    "cast": [
      [
        "Bob Denver",
        "Dusty"
      ],
      [
        "Forrest Tucker",
        "Callahan"
      ],
      [
        "Jeannine Riley",
        "Lulu"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1期",
        "duration": 1424,
        "srcs": [
          "https://archive.org/download/DustysTrail5/DustysTrail6.ia.mp4",
          "https://archive.org/download/DustysTrail5/DustysTrail6.mp4",
          "https://archive.org/download/DustysTrail5/DustysTrail6_512kb.mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2期",
        "duration": 1365,
        "srcs": [
          "https://archive.org/download/DustysTrailTomahawkTerritory/Dusty's%20Trail%20Tomahawk%20Territory.mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3期",
        "duration": 1423,
        "srcs": [
          "https://archive.org/download/Jeice_Murdered_My_Family/Dusty_10.ia.mp4",
          "https://archive.org/download/Jeice_Murdered_My_Family/Dusty_10.mp4",
          "https://archive.org/download/Jeice_Murdered_My_Family/Dusty_10_512kb.mp4"
        ]
      }
    ]
  },
  {
    "t": "variety",
    "title": "奥兹与哈里特",
    "original": "The Adventures of Ozzie and Harriet",
    "y": 1959,
    "region": "美国",
    "g": [
      "情景喜剧",
      "家庭"
    ],
    "s": 8,
    "hot": 7680,
    "vip": false,
    "badge": "",
    "c": [
      "#cdb4db",
      "#457b9d"
    ],
    "e": "📺",
    "desc": "五十年代美国家庭喜剧的样板：尼尔森一家把日常生活过成了连续播出十四年的电视节目。",
    "director": "Ozzie Nelson",
    "cast": [
      [
        "Ozzie Nelson",
        "Ozzie"
      ],
      [
        "Harriet Nelson",
        "Harriet"
      ],
      [
        "David Nelson",
        "David"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1期",
        "duration": 1748,
        "srcs": [
          "https://archive.org/download/DavidNelsonIsBetterThanFamilyGuy/DavidtheSleuth.ia.mp4",
          "https://archive.org/download/DavidNelsonIsBetterThanFamilyGuy/DavidtheSleuth.mp4",
          "https://archive.org/download/DavidNelsonIsBetterThanFamilyGuy/DavidtheSleuth_512kb.mp4"
        ]
      }
    ]
  },
  {
    "t": "variety",
    "title": "米奇·鲁尼秀",
    "original": "The Mickey Rooney Show",
    "y": 1954,
    "region": "美国",
    "g": [
      "喜剧",
      "情景喜剧"
    ],
    "s": 7.8,
    "hot": 7540,
    "vip": false,
    "badge": "",
    "c": [
      "#e63946",
      "#f1faee"
    ],
    "e": "🎪",
    "desc": "五十年代情景喜剧：一个总在帮倒忙的年轻人，和他永远收拾不完的烂摊子。",
    "director": "Mickey Rooney 主演",
    "cast": [
      [
        "Mickey Rooney",
        "Mickey"
      ],
      [
        "Regis Toomey",
        "Mr. Brown"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1期",
        "duration": 1552,
        "srcs": [
          "https://archive.org/download/TheMickeyRooneyShowFanMail/The%20Mickey%20Rooney%20Show%20-%20Fan%20Mail.mp4"
        ]
      }
    ]
  },
  {
    "t": "anime",
    "title": "乐一通经典合集",
    "original": "Looney Tunes Classics",
    "y": 1930,
    "region": "美国",
    "g": [
      "动画",
      "喜剧"
    ],
    "s": 8.7,
    "hot": 9340,
    "vip": true,
    "badge": "合集",
    "c": [
      "#f4a261",
      "#2a9d8f"
    ],
    "e": "🐰",
    "desc": "华纳早期动画短片合集，Bosko、Buddy 等一批进入公有领域的经典角色轮番登场，共 24 话。",
    "director": "华纳动画组",
    "cast": [
      [
        "配音",
        "Bosko"
      ],
      [
        "配音",
        "Buddy"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1话",
        "duration": 455,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/A%20Coy%20Decoy%20(1941).mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2话",
        "duration": 411,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Ain't%20Nature%20Grand!%20(1930).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Ain't%20Nature%20Grand!%20(1930).mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3话",
        "duration": 433,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Ali-Baba%20Bound%20(1940).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Porky's%20Railroad%20(1937).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Porky's%20Railroad%20(1937).mp4"
        ]
      },
      {
        "no": 4,
        "title": "第4话",
        "duration": 407,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Battling%20Bosko%20(1932).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Battling%20Bosko%20(1932).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20at%20the%20Zoo%20(1932).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20at%20the%20Zoo%20(1932).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Dizzy%20Date%20(1932).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Dizzy%20Date%20(1932).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Fox%20Hunt%20(1931).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Fox%20Hunt%20(1931).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Porky's%20Preview%20(1941).mp4"
        ]
      },
      {
        "no": 5,
        "title": "第5话",
        "duration": 467,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Big%20Man%20from%20the%20North%20(1930).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Big%20Man%20from%20the%20North%20(1930).mp4"
        ]
      },
      {
        "no": 6,
        "title": "第6话",
        "duration": 417,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Big-Hearted%20Bosko%20(1932).mp4"
        ]
      },
      {
        "no": 7,
        "title": "第7话",
        "duration": 456,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Boom%20Boom%20(1936).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Boom%20Boom%20(1936).mp4"
        ]
      },
      {
        "no": 8,
        "title": "第8话",
        "duration": 397,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20and%20Bruno%20(1932).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20and%20Bruno%20(1932).mp4"
        ]
      },
      {
        "no": 9,
        "title": "第9话",
        "duration": 402,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20at%20the%20Beach%20(1932).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Hollywood%20Capers%20(1935).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Hollywood%20Capers%20(1935).mp4"
        ]
      },
      {
        "no": 10,
        "title": "第10话",
        "duration": 399,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20Shipwrecked!%20(1931).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20Shipwrecked!%20(1931).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Box%20Car%20Blues%20(1930).mp4"
        ]
      },
      {
        "no": 11,
        "title": "第11话",
        "duration": 429,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20the%20Lumberjack%20(1932).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko%20the%20Lumberjack%20(1932).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Who's%20Who%20in%20the%20Zoo%20(1942).mp4"
        ]
      },
      {
        "no": 12,
        "title": "第12话",
        "duration": 423,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Dog%20Race%20(1932).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Dog%20Race%20(1932).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Porky's%20Bear%20Facts%20(1941).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Porky's%20Bear%20Facts%20(1941).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/The%20Tree's%20Knees%20(1931).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/The%20Tree's%20Knees%20(1931).mp4"
        ]
      },
      {
        "no": 13,
        "title": "第13话",
        "duration": 431,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Party%20(1932).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Party%20(1932).mp4"
        ]
      },
      {
        "no": 14,
        "title": "第14话",
        "duration": 410,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Soda%20Fountain%20(1931).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Soda%20Fountain%20(1931).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Eatin'%20on%20the%20Cuff%20or%20the%20Moth%20Who%20Came%20to%20Dinner%20(1942).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Ups%20'n%20Downs%20(1931).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Ups%20'n%20Downs%20(1931).mp4"
        ]
      },
      {
        "no": 15,
        "title": "第15话",
        "duration": 427,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Store%20(1932).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Bosko's%20Store%20(1932).mp4"
        ]
      },
      {
        "no": 16,
        "title": "第16话",
        "duration": 494,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Case%20of%20the%20Missing%20Hare%20(1942).mp4"
        ]
      },
      {
        "no": 17,
        "title": "第17话",
        "duration": 453,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Confusions%20of%20a%20Nutzy%20Spy%20(1943).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Confusions%20of%20a%20Nutzy%20Spy%20(1943).mp4"
        ]
      },
      {
        "no": 18,
        "title": "第18话",
        "duration": 380,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Congo%20Jazz%20(1930).mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Hold%20Anything%20(1930).mp4"
        ]
      },
      {
        "no": 19,
        "title": "第19话",
        "duration": 447,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Daffy%20-%20The%20Commando%20(1943).mp4"
        ]
      },
      {
        "no": 20,
        "title": "第20话",
        "duration": 448,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Daffy's%20Southern%20Exposure%20(1942).mp4"
        ]
      },
      {
        "no": 21,
        "title": "第21话",
        "duration": 452,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Get%20Rich%20Quick%20Porky%20(1937).mp4"
        ]
      },
      {
        "no": 22,
        "title": "第22话",
        "duration": 424,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Gopher%20Goofy%20(1942).ia.mp4",
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Gopher%20Goofy%20(1942).mp4"
        ]
      },
      {
        "no": 23,
        "title": "第23话",
        "duration": 367,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Hobby%20Horse-Laffs%20(1942).mp4"
        ]
      },
      {
        "no": 24,
        "title": "第24话",
        "duration": 434,
        "srcs": [
          "https://archive.org/download/looney-tunes-classics-public-domain-collection/Hop%20and%20Go%20(1943).mp4"
        ]
      }
    ]
  },
  {
    "t": "anime",
    "title": "幸运兔奥斯瓦德",
    "original": "Oswald the Lucky Rabbit",
    "y": 1928,
    "region": "美国",
    "g": [
      "动画",
      "经典"
    ],
    "s": 8.3,
    "hot": 8760,
    "vip": false,
    "badge": "合集",
    "c": [
      "#264653",
      "#e9c46a"
    ],
    "e": "🐇",
    "desc": "动画史上的早期明星兔子：奥斯瓦德的 24 部短片合集，橡皮管动画时代的想象力一览无余。",
    "director": "Walter Lantz / Ub Iwerks 等",
    "cast": [
      [
        "配音",
        "Oswald"
      ],
      [
        "配音",
        "Ortensia"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1话",
        "duration": 320,
        "srcs": [
          "https://archive.org/download/oswald-collection/01%20-%20Poor%20Papa%20(Disney,%201928).mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2话",
        "duration": 347,
        "srcs": [
          "https://archive.org/download/oswald-collection/02%20-%20Trolley%20Troubles%20(Disney,%201927).mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3话",
        "duration": 362,
        "srcs": [
          "https://archive.org/download/oswald-collection/03%20-%20Oh%20Teacher%20(Disney,%201927)%20(MISSING%20FOOTAGE).mp4",
          "https://archive.org/download/oswald-collection/03%20-%20Oh%20Teacher%20(Disney,%201927).mp4"
        ]
      },
      {
        "no": 4,
        "title": "第4话",
        "duration": 411,
        "srcs": [
          "https://archive.org/download/oswald-collection/04%20-%20Great%20Guns!%20(Disney,%201927).mp4"
        ]
      },
      {
        "no": 5,
        "title": "第5话",
        "duration": 372,
        "srcs": [
          "https://archive.org/download/oswald-collection/05%20-%20The%20Mechanical%20Cow%20(Disney%201927).mp4",
          "https://archive.org/download/oswald-collection/05%20-%20The%20Mechanical%20Cow%20(Disney,%201927).mp4"
        ]
      },
      {
        "no": 6,
        "title": "第6话",
        "duration": 400,
        "srcs": [
          "https://archive.org/download/oswald-collection/06%20-%20All%20Wet%20(Disney,%201927).mp4"
        ]
      },
      {
        "no": 7,
        "title": "第7话",
        "duration": 111,
        "srcs": [
          "https://archive.org/download/oswald-collection/11%20-%20Neck%20'n'%20Neck%20(Disney,%201928)%20(FRAGMENT).mp4"
        ]
      },
      {
        "no": 8,
        "title": "第8话",
        "duration": 263,
        "srcs": [
          "https://archive.org/download/oswald-collection/12%20-%20Empty%20Socks%20(Disney,%201927)%20(INCOMPLETE).mp4"
        ]
      },
      {
        "no": 9,
        "title": "第9话",
        "duration": 375,
        "srcs": [
          "https://archive.org/download/oswald-collection/13%20-%20The%20Ol'%20Swimmin'%20'Ole%20(Disney,%201928)%20(INCOMPLETE%20RECONSTRUCTION).mp4"
        ]
      },
      {
        "no": 10,
        "title": "第10话",
        "duration": 351,
        "srcs": [
          "https://archive.org/download/oswald-collection/14%20-%20Africa%20Before%20Dark%20(Disney,%201928).mp4"
        ]
      },
      {
        "no": 11,
        "title": "第11话",
        "duration": 462,
        "srcs": [
          "https://archive.org/download/oswald-collection/15%20-%20Bright%20Lights%20(Disney,%201928).mp4"
        ]
      },
      {
        "no": 12,
        "title": "第12话",
        "duration": 387,
        "srcs": [
          "https://archive.org/download/oswald-collection/16%20-%20Rival%20Romeos%20(Disney,%201928).mp4"
        ]
      },
      {
        "no": 13,
        "title": "第13话",
        "duration": 62,
        "srcs": [
          "https://archive.org/download/oswald-collection/17%20-%20Sagebrush%20Sadie%20(Disney,%201928)%20(GENGA).mp4"
        ]
      },
      {
        "no": 14,
        "title": "第14话",
        "duration": 313,
        "srcs": [
          "https://archive.org/download/oswald-collection/19%20-%20Ozzie%20of%20the%20Mounted%20(Disney,%201928).mp4"
        ]
      },
      {
        "no": 15,
        "title": "第15话",
        "duration": 322,
        "srcs": [
          "https://archive.org/download/hungry-hoboes-1928_202502/Hungry%20Hoboes%20(1928).mp4",
          "https://archive.org/download/hungry-hoboes-1928_202502/Hungry%20Hoboes%20(1928).ia.mp4",
          "https://archive.org/download/hungry-hoboes-1928/Hungry-Hobes-1928.mp4"
        ]
      },
      {
        "no": 16,
        "title": "第16话",
        "duration": 350,
        "srcs": [
          "https://archive.org/download/oh-what-a-knight-1928/Oh%20What%20a%20Knight%20(1928).mp4",
          "https://archive.org/download/oh-what-a-knight_1928/oh-what-a-knight_1928.mp4",
          "https://archive.org/download/oh-what-a-knight_1928/oh-what-a-knight_1928.ia.mp4"
        ]
      },
      {
        "no": 17,
        "title": "第17话",
        "duration": 337,
        "srcs": [
          "https://archive.org/download/oswald-collection/22%20-%20The%20Sky%20Scrapper%20(Disney,%201928).mp4"
        ]
      },
      {
        "no": 18,
        "title": "第18话",
        "duration": 325,
        "srcs": [
          "https://archive.org/download/oswald-collection/23%20-%20The%20Fox%20Chase%20(Disney,%201928).mp4"
        ]
      },
      {
        "no": 19,
        "title": "第19话",
        "duration": 397,
        "srcs": [
          "https://archive.org/download/oswald-collection/27%20-%20High%20Up%20(Disney-Winkler,%201928).mp4"
        ]
      },
      {
        "no": 20,
        "title": "第20话",
        "duration": 312,
        "srcs": [
          "https://archive.org/download/oswald-collection/30%20-%20Fiery%20Firemen%20(Winkler,%201928).mp4"
        ]
      },
      {
        "no": 21,
        "title": "第21话",
        "duration": 377,
        "srcs": [
          "https://archive.org/download/oswald-collection/36%20-%20Homeless%20Homer%20(Winkler,%201929).mp4"
        ]
      },
      {
        "no": 22,
        "title": "第22话",
        "duration": 322,
        "srcs": [
          "https://archive.org/download/oswald-collection/37%20-%20Yanky%20Clippers%20(Winkler,%201929).mp4"
        ]
      },
      {
        "no": 23,
        "title": "第23话",
        "duration": 344,
        "srcs": [
          "https://archive.org/download/oswald-collection/39%20-%20Sick%20Cylinders%20(Winkler,%201929)%20(SILENT).ia.mp4",
          "https://archive.org/download/oswald-collection/39%20-%20Sick%20Cylinders%20(Winkler,%201929)%20(SILENT).mp4"
        ]
      },
      {
        "no": 24,
        "title": "第24话",
        "duration": 342,
        "srcs": [
          "https://archive.org/download/oswald-collection/40%20-%20Hold%20'Em%20Ozzie!%20(Winkler,%201929)%20(SILENT).ia.mp4",
          "https://archive.org/download/oswald-collection/40%20-%20Hold%20'Em%20Ozzie!%20(Winkler,%201929)%20(SILENT).mp4"
        ]
      }
    ]
  },
  {
    "t": "anime",
    "title": "迪士尼早期动画集",
    "original": "Public Domain Disney Cartoons",
    "y": 1928,
    "region": "美国",
    "g": [
      "动画",
      "经典"
    ],
    "s": 8.4,
    "hot": 8620,
    "vip": false,
    "badge": "合集",
    "c": [
      "#1d3557",
      "#f1faee"
    ],
    "e": "🎬",
    "desc": "1928 年前后进入公有领域的迪士尼早期动画短片，米老鼠与《爱丽丝喜剧系列》的开端之作。",
    "director": "Walt Disney / Ub Iwerks",
    "cast": [
      [
        "配音",
        "Mickey"
      ],
      [
        "配音",
        "Alice"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1话",
        "duration": 180,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/All%20Together%20(1942).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/All%20Together%20(1942).mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2话",
        "duration": 509,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Cleanliness%20Brings%20Health%20(1945).mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3话",
        "duration": 216,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Donald's%20Decision%20(1942).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/Donald's%20Decision%20(1942).mp4"
        ]
      },
      {
        "no": 4,
        "title": "第4话",
        "duration": 608,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Education%20for%20Death%20(1943).mp4"
        ]
      },
      {
        "no": 5,
        "title": "第5话",
        "duration": 377,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Hooked%20Bear%20(1956).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/Hooked%20Bear%20(1956).mp4"
        ]
      },
      {
        "no": 6,
        "title": "第6话",
        "duration": 317,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Mickey's%20Surprise%20Party%20(1939).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/Mickey's%20Surprise%20Party%20(1939).mp4"
        ]
      },
      {
        "no": 7,
        "title": "第7话",
        "duration": 313,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Minnie's%20Yoo%20Hoo%20(1930).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/Minnie's%20Yoo%20Hoo%20(1930).mp4"
        ]
      },
      {
        "no": 8,
        "title": "第8话",
        "duration": 200,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Out%20Of%20The%20Frying%20Pan%20Into%20The%20Firing%20Line%20(1942).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/Out%20Of%20The%20Frying%20Pan%20Into%20The%20Firing%20Line%20(1942).mp4"
        ]
      },
      {
        "no": 9,
        "title": "第9话",
        "duration": 355,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Plane%20Crazy%20(1928,%20silent%20version).mp4"
        ]
      },
      {
        "no": 10,
        "title": "第10话",
        "duration": 359,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Plane%20Crazy%20(1928).mp4"
        ]
      },
      {
        "no": 11,
        "title": "第11话",
        "duration": 467,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Steamboat%20Willie%20(1928).mp4"
        ]
      },
      {
        "no": 12,
        "title": "第12话",
        "duration": 494,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/Susie,%20The%20Little%20Blue%20Coupe%20(1952).mp4"
        ]
      },
      {
        "no": 13,
        "title": "第13话",
        "duration": 482,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/The%20Cookie%20Carnival%20(1935).mp4"
        ]
      },
      {
        "no": 14,
        "title": "第14话",
        "duration": 366,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/The%20Gallopin'%20Gaucho%20(1928,%20Computer%20Colorized).mp4"
        ]
      },
      {
        "no": 15,
        "title": "第15话",
        "duration": 397,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/The%20Gallopin'%20Gaucho%20(1928).mp4"
        ]
      },
      {
        "no": 16,
        "title": "第16话",
        "duration": 395,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/The%20Mad%20Doctor%20(1933).mp4"
        ]
      },
      {
        "no": 17,
        "title": "第17话",
        "duration": 414,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/The%20Mad%20Doctor%20(Computer%20Colorized).mp4"
        ]
      },
      {
        "no": 18,
        "title": "第18话",
        "duration": 343,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/The%20Spirit%20Of%20'43%20(1943).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/The%20Spirit%20Of%20'43%20(1943).mp4"
        ]
      },
      {
        "no": 19,
        "title": "第19话",
        "duration": 252,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/The%20Thrifty%20Pig%20(1941).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/The%20Thrifty%20Pig%20(1941).mp4"
        ]
      },
      {
        "no": 20,
        "title": "第20话",
        "duration": 586,
        "srcs": [
          "https://archive.org/download/disneycartoons-publicdomain/The%20Winged%20Scourge%20(1943).ia.mp4",
          "https://archive.org/download/disneycartoons-publicdomain/The%20Winged%20Scourge%20(1943).mp4"
        ]
      }
    ]
  },
  {
    "t": "anime",
    "title": "星际机甲 Sci-Bots",
    "original": "Sci-Bots: Spaceketeers",
    "y": 1987,
    "region": "美国",
    "g": [
      "机甲",
      "科幻"
    ],
    "s": 8.1,
    "hot": 8420,
    "vip": true,
    "badge": "",
    "c": [
      "#000814",
      "#4cc9f0"
    ],
    "e": "🤖",
    "desc": "八十年代机甲动画合集，共 3 话长篇：太空火枪手们驾驶合体机甲，迎战一条又一条战线。",
    "director": "Jim Terry 制作",
    "cast": [
      [
        "配音",
        "Spaceketeers"
      ],
      [
        "配音",
        "Saiyuki"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1话",
        "duration": 3461,
        "srcs": [
          "https://archive.org/download/sci-bots-vol.-1-to-3-remastered-krypton-force-spacekeeters-sf-saiyuki-starzinger-toei/Sci-Bots%201%20-%20Conflict.mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2话",
        "duration": 2836,
        "srcs": [
          "https://archive.org/download/sci-bots-vol.-1-to-3-remastered-krypton-force-spacekeeters-sf-saiyuki-starzinger-toei/Sci-Bots%202%20-%20Strike%20Back.mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3话",
        "duration": 2637,
        "srcs": [
          "https://archive.org/download/sci-bots-vol.-1-to-3-remastered-krypton-force-spacekeeters-sf-saiyuki-starzinger-toei/Sci-Bots%203%20-%20Battle%20of%20the%20Dragon.mp4"
        ]
      }
    ]
  },
  {
    "t": "anime",
    "title": "格列佛游记",
    "original": "Gulliver's Travels (1939)",
    "y": 1939,
    "region": "美国",
    "g": [
      "动画",
      "冒险"
    ],
    "s": 7.9,
    "hot": 7960,
    "vip": false,
    "badge": "",
    "c": [
      "#6a994e",
      "#a7c957"
    ],
    "e": "⛵",
    "desc": "弗莱舍兄弟制作的动画长片：格列佛漂流到小人国，成了两个小人国之间战争的关键砝码。",
    "director": "Max Fleischer",
    "cast": [
      [
        "配音",
        "Gulliver"
      ],
      [
        "配音",
        "Gabby"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4307,
        "srcs": [
          "https://archive.org/download/gullivers-travels-star-classics/Gulliver's%20Travels%20Star%20Classics.mp4"
        ]
      }
    ]
  },
  {
    "t": "doc",
    "title": "星辰与人类",
    "original": "Of Stars and Men",
    "y": 1962,
    "region": "美国",
    "g": [
      "科普",
      "动画"
    ],
    "s": 8.6,
    "hot": 8760,
    "vip": false,
    "badge": "",
    "c": [
      "#03045e",
      "#caf0f8"
    ],
    "e": "✨",
    "desc": "以动画形式讲述人类从认识星空到追问自身位置的科普纪录片，一部写给宇宙与童年的散文诗。",
    "director": "John Hubley",
    "cast": [
      [
        "解说",
        "Mark Hubley"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 3208,
        "srcs": [
          "https://archive.org/download/Of_Stars_and_Men/videoplayback%20(4).mp4"
        ]
      }
    ]
  },
  {
    "t": "doc",
    "title": "草原：一个民族的生存之战",
    "original": "Grass: A Nation's Battle for Life (1925)",
    "y": 1925,
    "region": "美国",
    "g": [
      "人文",
      "探险"
    ],
    "s": 8.5,
    "hot": 8580,
    "vip": false,
    "badge": "经典",
    "c": [
      "#7f5539",
      "#e6ccb2"
    ],
    "e": "🐎",
    "desc": "1925 年探险纪录片：摄制组跟随伊朗巴赫蒂亚里部落跨越雪山与激流，完成一年一度的季节大迁徙。",
    "director": "Merian C. Cooper / Ernest B. Schoedsack",
    "cast": [
      [
        "记录者",
        "Merian C. Cooper"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 4261,
        "srcs": [
          "https://archive.org/download/1925-grass-a-nations-battle-for-life_202207/1925%20%20Grass%20-%20A%20Nations%20Battle%20For%20Life.mp4"
        ]
      }
    ]
  },
  {
    "t": "doc",
    "title": "山谷人家",
    "original": "The Hollow (1975)",
    "y": 1975,
    "region": "美国",
    "g": [
      "人文",
      "纪实"
    ],
    "s": 7.8,
    "hot": 7420,
    "vip": false,
    "badge": "",
    "c": [
      "#495057",
      "#adb5bd"
    ],
    "e": "🏞",
    "desc": "七十年代纪实影像：镜头在美国一处山谷社区停留，记录居民的生活方式、劳作与闲谈。",
    "director": "纪录片组",
    "cast": [
      [
        "记录者",
        "攝制组"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 3796,
        "srcs": [
          "https://archive.org/download/The_Hollow_1975/videoplayback.mp4"
        ]
      }
    ]
  },
  {
    "t": "doc",
    "title": "真理与勇气",
    "original": "VERITAS ET VIRTUS",
    "y": 2015,
    "region": "美国",
    "g": [
      "纪实",
      "人文"
    ],
    "s": 7.7,
    "hot": 7320,
    "vip": false,
    "badge": "",
    "c": [
      "#343a40",
      "#dee2e6"
    ],
    "e": "🗽",
    "desc": "一部关于责任与信念的独立纪录片：几位普通人如何在自己的岗位上做出选择。",
    "director": "纪录片组",
    "cast": [
      [
        "记录者",
        "摄制组"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 2424,
        "srcs": [
          "https://archive.org/download/veritas-et-virtus/Truth%20and%20Valor.mp4"
        ]
      }
    ]
  },
  {
    "t": "doc",
    "title": "圣灵之人",
    "original": "Holy Ghost People (1967)",
    "y": 1967,
    "region": "美国",
    "g": [
      "人文",
      "宗教"
    ],
    "s": 8,
    "hot": 7640,
    "vip": false,
    "badge": "",
    "c": [
      "#5f0f40",
      "#fb8b24"
    ],
    "e": "🕯",
    "desc": "1967 年经典纪实影像：摄制组在阿巴拉契亚山区记录了一场持续整夜的宗教仪式与社区生活。",
    "director": "Peter Adair",
    "cast": [
      [
        "记录者",
        "Peter Adair"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 3106,
        "srcs": [
          "https://archive.org/download/HolyGhostPeople_201403/Holy%20Ghost%20People%20(1967).mp4"
        ]
      }
    ]
  },
  {
    "t": "kids",
    "title": "漫画童谣集",
    "original": "Comictunes (CVN)",
    "y": 1990,
    "region": "美国",
    "g": [
      "动画",
      "儿歌"
    ],
    "s": 8.3,
    "hot": 8420,
    "vip": false,
    "badge": "",
    "c": [
      "#ffb703",
      "#8ecae6"
    ],
    "e": "🎵",
    "desc": "经典儿歌与童话动画合集，共 8 集：把《胡桃夹子》《阿拉丁》等故事唱成了小朋友能跟着哼的旋律。",
    "director": "Children's Video Network",
    "cast": [
      [
        "配音",
        "解说员"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1集",
        "duration": 1595,
        "srcs": [
          "https://archive.org/download/comictunes-cvn-philip-loro-rereleases/(CVN)%20Comictunes%20No.%201%20-%20The%20Nutcracker.mp4"
        ]
      },
      {
        "no": 2,
        "title": "第2集",
        "duration": 1786,
        "srcs": [
          "https://archive.org/download/comictunes-cvn-philip-loro-rereleases/(CVN)%20Comictunes%20No.%2016%20-%20Tales%20of%20Abbott%20&%20Costello.mp4"
        ]
      },
      {
        "no": 3,
        "title": "第3集",
        "duration": 1477,
        "srcs": [
          "https://archive.org/download/comictunes-cvn-philip-loro-rereleases/(CVN)%20Comictunes%20No.%205%20-%20Aladdin%20&%20His%20Magic%20Lamp.mp4"
        ]
      },
      {
        "no": 4,
        "title": "第4集",
        "duration": 1670,
        "srcs": [
          "https://archive.org/download/comictunes-cvn-philip-loro-rereleases/(CVN)%20Comictunes%20No.%206%20-%20Simple%20Simon%20&%20Other%20Cartoon%20Classics.mp4"
        ]
      },
      {
        "no": 5,
        "title": "第5集",
        "duration": 1789,
        "srcs": [
          "https://archive.org/download/comictunes-cvn-philip-loro-rereleases/Comictunes%20-%20Humpty%20Dumpty%20&%20Other%20Cartoon%20Classics%20(CVN%20re-release).mp4"
        ]
      },
      {
        "no": 6,
        "title": "第6集",
        "duration": 1544,
        "srcs": [
          "https://archive.org/download/comictunes-cvn-philip-loro-rereleases/Comictunes%20-%20Little%20Lulu%20(CVN%20re-release).mp4"
        ]
      },
      {
        "no": 7,
        "title": "第7集",
        "duration": 1508,
        "srcs": [
          "https://archive.org/download/comictunes-cvn-philip-loro-rereleases/Comictunes%20-%20Sinbad%20the%20Sailor%20&%20Other%20Cartoon%20Classics%20(CVN%20re-release).mp4"
        ]
      },
      {
        "no": 8,
        "title": "第8集",
        "duration": 1506,
        "srcs": [
          "https://archive.org/download/comictunes-cvn-philip-loro-rereleases/Comictunes%20-%20The%20Adventures%20of%20Daffy%20Duck%20(CVN%20re-release).mp4"
        ]
      }
    ]
  },
  {
    "t": "kids",
    "title": "卡通经典·第一辑",
    "original": "PD Cartoon Classics Vol.1",
    "y": 1940,
    "region": "美国",
    "g": [
      "动画",
      "经典"
    ],
    "s": 8.2,
    "hot": 8260,
    "vip": false,
    "badge": "",
    "c": [
      "#219ebc",
      "#ffb703"
    ],
    "e": "🎠",
    "desc": "二十五部公有领域动画短片组成的三小时合集，一个下午都看不完的童年快乐。",
    "director": "多位早期动画导演",
    "cast": [
      [
        "配音",
        "群星"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1集",
        "duration": 10499,
        "srcs": [
          "https://archive.org/download/cartoon-classics-vol-1-25-favorite-cartoons-3-hours/Cartoon%20Classics%20-%20Vol_%201_%2025%20Favorite%20Cartoons%20-%203%20Hours.ia.mp4",
          "https://archive.org/download/cartoon-classics-vol-1-25-favorite-cartoons-3-hours/Cartoon%20Classics%20-%20Vol_%201_%2025%20Favorite%20Cartoons%20-%203%20Hours.mp4"
        ]
      }
    ]
  },
  {
    "t": "kids",
    "title": "卡通经典·第二辑",
    "original": "PD Cartoon Classics Vol.2",
    "y": 1940,
    "region": "美国",
    "g": [
      "动画",
      "经典"
    ],
    "s": 8.1,
    "hot": 8140,
    "vip": false,
    "badge": "",
    "c": [
      "#fb8500",
      "#8ecae6"
    ],
    "e": "🎡",
    "desc": "第二辑继续带来二十五部经典动画短片，滑稽追逐、音乐节拍与老派笑料一应俱全。",
    "director": "多位早期动画导演",
    "cast": [
      [
        "配音",
        "群星"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "第1集",
        "duration": 10997,
        "srcs": [
          "https://archive.org/download/cartoon-classics-vol-2-25-favorite-cartoons-3-hours/Cartoon%20Classics%20-%20Vol_%202_%2025%20Favorite%20Cartoons%20-%203%20Hours.ia.mp4",
          "https://archive.org/download/cartoon-classics-vol-2-25-favorite-cartoons-3-hours/Cartoon%20Classics%20-%20Vol_%202_%2025%20Favorite%20Cartoons%20-%203%20Hours.mp4"
        ]
      }
    ]
  },
  {
    "t": "kids",
    "title": "大力水手：辛巴达",
    "original": "Popeye Meets Sindbad",
    "y": 1936,
    "region": "美国",
    "g": [
      "动画",
      "冒险"
    ],
    "s": 8.4,
    "hot": 8580,
    "vip": false,
    "badge": "",
    "c": [
      "#06d6a0",
      "#118ab2"
    ],
    "e": "⚓",
    "desc": "大力水手的经典短片：辛巴达抢走了奥莉芙，波派带着菠菜罐头杀上了怪物岛。",
    "director": "Dave Fleischer",
    "cast": [
      [
        "配音",
        "Popeye"
      ],
      [
        "配音",
        "Olive Oyl"
      ],
      [
        "配音",
        "Bluto"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 1889,
        "srcs": [
          "https://archive.org/download/kids-klassics-popeye-sindbad/KIDS%20KLASSICS%20-%20POPEYE%20SINDBAD.mp4"
        ]
      }
    ]
  },
  {
    "t": "kids",
    "title": "气球乐园的一天",
    "original": "Fun in Balloon Land (1965)",
    "y": 1965,
    "region": "美国",
    "g": [
      "益智",
      "真人"
    ],
    "s": 7.9,
    "hot": 7720,
    "vip": false,
    "badge": "",
    "c": [
      "#ffd166",
      "#ef476f"
    ],
    "e": "🎈",
    "desc": "经典儿童节目：跟着镜头走进气球乐园，认识颜色、数字与形状，顺便看一场热气球游行。",
    "director": "儿童节目组",
    "cast": [
      [
        "主持",
        "向导"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 3158,
        "srcs": [
          "https://archive.org/download/Fun_in_Balloon_Land_1965/videoplayback%20(2).mp4"
        ]
      }
    ]
  },
  {
    "t": "kids",
    "title": "恐龙岛历险",
    "original": "Wolf Tracers: Dinosaur Island",
    "y": 2004,
    "region": "美国",
    "g": [
      "科普",
      "动画"
    ],
    "s": 7.8,
    "hot": 7580,
    "vip": false,
    "badge": "",
    "c": [
      "#52796f",
      "#84a98c"
    ],
    "e": "🦕",
    "desc": "为小朋友准备的恐龙科普片：跟着探险队登上「恐龙岛」，认识那些只存在于化石里的庞然大物。",
    "director": "儿童科普组",
    "cast": [
      [
        "主持",
        "Wolf Tracers"
      ]
    ],
    "episodes": [
      {
        "no": 1,
        "title": "正片",
        "duration": 2515,
        "srcs": [
          "https://archive.org/download/wolf-tracers-dinosaur-island/Wolf%20Tracers%20%20%20%20-%20%20Dinosaur%20Island.ia.mp4",
          "https://archive.org/download/wolf-tracers-dinosaur-island/Wolf%20Tracers%20%20%20%20-%20%20Dinosaur%20Island.mp4"
        ]
      }
    ]
  }
]
