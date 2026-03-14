from django.db import migrations

DIETARY_TAGS = [
    # ── Diet Styles ──────────────────────────────────────────────────────────
    {
        "name": "Vegan",
        "description": "Contains no animal products whatsoever, including meat, dairy, eggs, and honey.",
    },
    {
        "name": "Vegetarian",
        "description": "Free from meat and fish; may contain dairy and eggs.",
    },
    {
        "name": "Pescatarian",
        "description": "Excludes meat but includes fish and other seafood.",
    },
    {
        "name": "Flexitarian",
        "description": "Primarily plant-based with occasional inclusion of meat or fish.",
    },
    {
        "name": "Paleo",
        "description": "Based on foods similar to those eaten during the Paleolithic era — meats, fish, vegetables, fruits, nuts, and seeds. Excludes grains, legumes, and dairy.",
    },
    {
        "name": "Keto",
        "description": "Very low in carbohydrates and high in fat, designed to induce a state of ketosis.",
    },
    {
        "name": "Low-Carb",
        "description": "Restricts carbohydrate intake, typically below 100 g per day.",
    },
    {
        "name": "Low-Fat",
        "description": "Limits total fat content, typically below 30 % of daily calories.",
    },
    {
        "name": "Low-Sodium",
        "description": "Limits sodium content, suitable for people managing blood pressure or heart conditions.",
    },
    {
        "name": "Low-Calorie",
        "description": "Reduced in overall caloric content to support weight management.",
    },
    {
        "name": "Whole30",
        "description": "Eliminates sugar, alcohol, grains, legumes, soy, and dairy for 30 days.",
    },
    {
        "name": "Mediterranean",
        "description": "Emphasises vegetables, fruits, whole grains, fish, and olive oil inspired by Mediterranean cuisine.",
    },
    {
        "name": "DASH",
        "description": "Dietary Approaches to Stop Hypertension — low in sodium and rich in potassium, calcium, and magnesium.",
    },
    # ── Allergens & Intolerances ─────────────────────────────────────────────
    {
        "name": "Gluten-Free",
        "description": "Contains no gluten — suitable for people with celiac disease or gluten sensitivity.",
    },
    {
        "name": "Dairy-Free",
        "description": "Contains no milk or milk-derived ingredients.",
    },
    {
        "name": "Nut-Free",
        "description": "Contains no tree nuts or peanuts — suitable for people with nut allergies.",
    },
    {
        "name": "Peanut-Free",
        "description": "Contains no peanuts or peanut-derived ingredients.",
    },
    {
        "name": "Tree-Nut-Free",
        "description": "Contains no tree nuts such as almonds, cashews, walnuts, or pecans.",
    },
    {
        "name": "Egg-Free",
        "description": "Contains no eggs or egg-derived ingredients.",
    },
    {
        "name": "Soy-Free",
        "description": "Contains no soy or soy-derived ingredients.",
    },
    {
        "name": "Shellfish-Free",
        "description": "Contains no shellfish such as shrimp, crab, or lobster.",
    },
    {
        "name": "Fish-Free",
        "description": "Contains no fish or fish-derived ingredients.",
    },
    {
        "name": "Sesame-Free",
        "description": "Contains no sesame seeds or sesame-derived ingredients.",
    },
    {
        "name": "Corn-Free",
        "description": "Contains no corn or corn-derived ingredients.",
    },
    {
        "name": "Sulfite-Free",
        "description": "Contains no added sulfites — suitable for people with sulfite sensitivity.",
    },
    # ── Religious / Cultural ─────────────────────────────────────────────────
    {
        "name": "Halal",
        "description": "Prepared according to Islamic dietary laws; free from pork and alcohol.",
    },
    {
        "name": "Kosher",
        "description": "Prepared according to Jewish dietary laws.",
    },
    # ── Health & Lifestyle ───────────────────────────────────────────────────
    {
        "name": "Diabetic-Friendly",
        "description": "Low in added sugars and refined carbohydrates; suitable for blood-sugar management.",
    },
    {
        "name": "Heart-Healthy",
        "description": "Low in saturated fat, trans fat, and cholesterol; supports cardiovascular health.",
    },
    {
        "name": "High-Protein",
        "description": "Rich in protein — suitable for muscle building or high-activity lifestyles.",
    },
    {
        "name": "High-Fiber",
        "description": "Rich in dietary fibre to support digestive health and satiety.",
    },
    {
        "name": "Sugar-Free",
        "description": "Contains no added sugars or sugar substitutes.",
    },
    {
        "name": "Alcohol-Free",
        "description": "Contains no alcohol or alcohol-derived ingredients.",
    },
]


def seed_dietary_tags(apps, schema_editor):
    DietaryTag = apps.get_model("inventory", "DietaryTag")
    db_alias = schema_editor.connection.alias

    for tag_data in DIETARY_TAGS:
        DietaryTag.objects.using(db_alias).get_or_create(
            name=tag_data["name"],
            defaults={"description": tag_data["description"]},
        )


def remove_dietary_tags(apps, schema_editor):
    DietaryTag = apps.get_model("inventory", "DietaryTag")
    db_alias = schema_editor.connection.alias
    names = [t["name"] for t in DIETARY_TAGS]
    DietaryTag.objects.using(db_alias).filter(name__in=names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0002_initial"),
    ]

    operations = [
        migrations.RunPython(seed_dietary_tags, reverse_code=remove_dietary_tags),
    ]
