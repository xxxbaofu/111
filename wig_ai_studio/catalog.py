"""Catalog data for AI Wig Studio."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WigProduct:
    """Static catalog product model."""

    product_id: str
    name: str
    category: str
    style: str
    texture: str
    base_color: str
    color_family: str
    length_cm: int
    weight_g: int
    price_cny: int
    cap_min_cm: int
    cap_max_cm: int
    scenes: tuple[str, ...]
    face_shapes: tuple[str, ...]
    cosplay: bool
    heat_resistant: bool
    stock: int
    rating: float
    description: str


WIG_CATALOG: tuple[WigProduct, ...] = (
    WigProduct(
        product_id="WIG-001",
        name="Velvet Bob Air",
        category="daily",
        style="bob",
        texture="straight",
        base_color="dark chocolate",
        color_family="brown",
        length_cm=30,
        weight_g=165,
        price_cny=499,
        cap_min_cm=53,
        cap_max_cm=58,
        scenes=("office", "campus", "daily"),
        face_shapes=("oval", "round", "heart"),
        cosplay=False,
        heat_resistant=True,
        stock=47,
        rating=4.8,
        description="轻薄空气刘海短发，适合日常通勤和轻妆。",
    ),
    WigProduct(
        product_id="WIG-002",
        name="Moonlight Wave 45",
        category="party",
        style="long-wave",
        texture="wavy",
        base_color="ash brown",
        color_family="brown",
        length_cm=45,
        weight_g=220,
        price_cny=699,
        cap_min_cm=54,
        cap_max_cm=60,
        scenes=("date", "party", "photo-shoot"),
        face_shapes=("oval", "square", "diamond"),
        cosplay=False,
        heat_resistant=True,
        stock=21,
        rating=4.7,
        description="高级感大波浪，适合夜景拍摄和约会。",
    ),
    WigProduct(
        product_id="WIG-003",
        name="Cyber Neon Pixie",
        category="cosplay",
        style="pixie",
        texture="straight",
        base_color="neon blue",
        color_family="blue",
        length_cm=22,
        weight_g=130,
        price_cny=399,
        cap_min_cm=52,
        cap_max_cm=57,
        scenes=("cosplay", "comic-con", "stage"),
        face_shapes=("oval", "heart", "diamond"),
        cosplay=True,
        heat_resistant=False,
        stock=33,
        rating=4.6,
        description="赛博朋克短发，亮色高饱和，适合角色扮演。",
    ),
    WigProduct(
        product_id="WIG-004",
        name="Sakura Twin Tail",
        category="cosplay",
        style="twin-tail",
        texture="curly",
        base_color="sakura pink",
        color_family="pink",
        length_cm=65,
        weight_g=360,
        price_cny=899,
        cap_min_cm=54,
        cap_max_cm=59,
        scenes=("cosplay", "anime-festival", "stage"),
        face_shapes=("round", "oval", "heart"),
        cosplay=True,
        heat_resistant=True,
        stock=16,
        rating=4.9,
        description="双马尾动漫风，高还原度造型，适合舞台与展会。",
    ),
    WigProduct(
        product_id="WIG-005",
        name="Ivory Bridal Silk 55",
        category="bridal",
        style="long-straight",
        texture="straight",
        base_color="natural black",
        color_family="black",
        length_cm=55,
        weight_g=250,
        price_cny=1299,
        cap_min_cm=53,
        cap_max_cm=59,
        scenes=("wedding", "ceremony", "photo-shoot"),
        face_shapes=("oval", "square", "heart"),
        cosplay=False,
        heat_resistant=True,
        stock=9,
        rating=4.95,
        description="婚礼级长直发，发丝顺滑，适配礼服造型。",
    ),
    WigProduct(
        product_id="WIG-006",
        name="Street Wolf Layer",
        category="fashion",
        style="wolf-cut",
        texture="layered",
        base_color="smoky silver",
        color_family="silver",
        length_cm=40,
        weight_g=210,
        price_cny=759,
        cap_min_cm=55,
        cap_max_cm=61,
        scenes=("street", "concert", "photo-shoot"),
        face_shapes=("square", "diamond", "oval"),
        cosplay=True,
        heat_resistant=True,
        stock=25,
        rating=4.72,
        description="层次狼尾剪裁，潮流街头与舞台兼顾。",
    ),
)


def get_catalog() -> list[WigProduct]:
    """Return catalog list for runtime usage."""
    return list(WIG_CATALOG)
