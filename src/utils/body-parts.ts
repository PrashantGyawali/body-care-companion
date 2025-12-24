const bodyParts = [
    { id: "id_maxillofacial", title: "maxillofacial", coords: [220, 58, 180, 58, 182, 84, 199, 107, 218, 82] },
    { id: "id_head", title: "head", coords: [198, 23, 175, 31, 165, 78, 188, 112, 212, 113, 234, 72, 224, 28] },
    { id: "id_neck", title: "neck", coords: [219, 105, 225, 125, 245, 135, 153, 137, 175, 124, 179, 103, 189, 112, 206, 115] },
    { id: "id_right_shoulder", title: "right_shoulder", coords: [153, 136, 122, 145, 121, 174, 146, 184] },
    { id: "id_left_shoulder", title: "left_shoulder", coords: [246, 134, 273, 144, 279, 173, 253, 182] },
    { id: "id_chest", title: "chest", coords: [154, 138, 244, 135, 253, 184, 249, 267, 199, 226, 152, 264, 147, 182] },
    { id: "id_abdominal", title: "abdominal", coords: [250, 268, 254, 292, 199, 312, 145, 290, 149, 268, 199, 230] },
    { id: "id_pelvis", title: "pelvis", coords: [254, 293, 256, 313, 201, 367, 140, 315, 145, 291, 199, 311] },
    { id: "id_left_hip", title: "left_hip", coords: [258, 313, 260, 344, 204, 368, 215, 353] },
    { id: "id_right_hip", title: "right_hip", coords: [141, 316, 139, 349, 196, 370, 185, 354] },
    { id: "id_left_femur_thigh", title: "left_femur_thigh", coords: [202, 369, 260, 345, 259, 443, 215, 457] },
    { id: "id_right_femur_thigh", title: "right_femur_thigh", coords: [197, 371, 183, 453, 140, 441, 136, 348] },
    { id: "id_left_knee", title: "left_knee", coords: [213, 457, 225, 507, 263, 498, 258, 444] },
    { id: "id_right_knee", title: "right_knee", coords: [187, 455, 142, 442, 136, 496, 174, 505] },
    { id: "id_right_tib_fib", title: "right_tib_fib", coords: [174, 505, 137, 497, 128, 533, 144, 604, 161, 605, 172, 548] },
    { id: "id_left_fib_tib", title: "left_fib_tib", coords: [226, 506, 226, 544, 237, 597, 257, 598, 268, 544, 265, 498, 244, 504] },
    { id: "id_left_ankle", title: "left_ankle", coords: [238, 598, 255, 598, 256, 631, 231, 633] },
    { id: "id_right_ankle", title: "right_ankle", coords: [163, 604, 145, 605, 143, 634, 167, 634] },
    { id: "id_right_foot", title: "right_foot", coords: [143, 633, 136, 680, 156, 697, 173, 692, 168, 636] },
    { id: "id_left_foot", title: "left_foot", coords: [230, 633, 225, 692, 246, 698, 261, 680, 257, 631] },
    { id: "id_right_humerus", title: "right_humerus", coords: [146, 185, 148, 222, 142, 250, 115, 240, 123, 196, 120, 175] },
    { id: "id_right_elbow", title: "right_elbow", coords: [117, 240, 142, 250, 140, 275, 110, 263] },
    { id: "id_right_forearm", title: "right_forearm", coords: [140, 276, 123, 317, 103, 308, 106, 292, 109, 264] },
    { id: "id_right_wrist", title: "right_wrist", coords: [124, 319, 117, 337, 95, 323, 103, 309] },
    { id: "id_right_hand", title: "right_hand", coords: [117, 337, 107, 378, 89, 388, 75, 377, 85, 343, 71, 346, 80, 330, 94, 323] },

    { id: "id_left_hand", title: "left_hand", coords: [285, 341, 304, 322, 317, 327, 333, 351, 317, 342, 324, 379, 309, 389, 291, 377] },
    { id: "id_left_wrist", title: "left_wrist", coords: [284, 340, 279, 319, 296, 309, 305, 321] },
    { id: "id_left_forearm", title: "left_forearm", coords: [261, 274, 290, 261, 297, 308, 276, 320] },
    { id: "id_left_elbow", title: "left_elbow", coords: [290, 261, 281, 240, 256, 249, 258, 274] },
    { id: "id_left_humerus", title: "left_humerus", coords: [278, 174, 279, 194, 283, 237, 256, 249, 253, 218, 254, 180] },

    { id: "id_skul_brain", title: "skul_brain", coords: [462, 29, 454, 73, 469, 93, 515, 92, 527, 74, 515, 29, 491, 13] },
    { id: "id_spine", title: "spine", coords: [480, 101, 481, 313, 498, 312, 499, 100] },
    { id: "id_buttocks", title: "buttocks", coords: [548, 312, 430, 313, 426, 366, 554, 366] },
    { id: "id_back", title: "back", coords: [542, 196, 539, 244, 549, 312, 432, 311, 439, 249, 438, 197] },

    { id: "id_right_shoulder_back", title: "right_shoulder_back", coords: [566, 141, 541, 195, 498, 196, 500, 106] },
    { id: "id_left_shoulder_back", title: "left_shoulder_back", coords: [480, 109, 415, 140, 438, 197, 480, 196] },

    { id: "id_right_arm", title: "right_arm", coords: [566, 143, 545, 189, 543, 207, 550, 269, 574, 329, 584, 372, 607, 385, 615, 374, 622, 338, 597, 315, 585, 288, 576, 238, 569, 190] },
    { id: "id_left_arm", title: "left_arm", coords: [398, 373, 377, 383, 368, 376, 360, 343, 371, 324, 392, 311, 397, 269, 405, 238, 410, 193, 408, 160, 416, 141, 437, 197, 430, 240, 429, 263, 408, 320, 399, 352] },

    { id: "id_right_leg", title: "right_leg", coords: [494, 366, 494, 387, 506, 428, 505, 464, 517, 500, 517, 536, 528, 590, 518, 665, 524, 695, 553, 682, 546, 607, 562, 529, 552, 475, 550, 435, 555, 365] },
    { id: "id_left_leg", title: "left_leg", coords: [486, 367, 426, 367, 427, 442, 428, 475, 417, 527, 433, 602, 432, 634, 425, 675, 446, 695, 464, 684, 459, 629, 450, 596, 464, 539, 463, 497, 474, 472, 478, 423] }
];

export {bodyParts};