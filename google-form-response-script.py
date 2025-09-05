import requests
from bs4 import BeautifulSoup
import re
import json
import random
import string
import os

# =========================
# Step 1: Parse Google Form
# =========================

def parse_form(form_url):
    """Parse Google Form and extract all questions, types, options, and entry IDs."""
    resp = requests.get(form_url)
    soup = BeautifulSoup(resp.text, "html.parser")

    # Grab the JS blob with FB_PUBLIC_LOAD_DATA_
    script_tag = next(s for s in soup.find_all("script") if "FB_PUBLIC_LOAD_DATA_" in s.text)
    raw_data = re.search(r"FB_PUBLIC_LOAD_DATA_ = (\[.*\]);", script_tag.text).group(1)
    data = json.loads(raw_data)

    questions = data[1][1]
    parsed = {}

    for q in questions:
        if not q or not isinstance(q, list):
            continue
        try:
            q_text = q[1]  # question text
            q_type = q[3]  # question type (0=text, 2=mcq, 3=checkbox, 4=dropdown, 5=scale)
            answers_block = q[4]

            entry_id = None
            options = []

            if answers_block and isinstance(answers_block, list) and len(answers_block) > 0:
                entry_id = answers_block[0][0]

                # Extract options if present
                if len(answers_block[0]) > 1 and answers_block[0][1]:
                    options = [opt[0] for opt in answers_block[0][1] if opt]

            if entry_id:
                parsed[q_text] = {
                    "id": f"entry.{entry_id}",
                    "type": q_type,
                    "options": options
                }
        except Exception:
            continue

    return parsed


# =====================================
# Step 2: Generate config (responses.json)
# =====================================

def generate_responses_template(data, filename="responses.json"):
    """Create a responses.json template with empty rules for each question."""
    responses = {}
    for q, meta in data.items():
        if meta["options"]:
            responses[q] = {opt: 0.0 for opt in meta["options"]}  # default weights = 0
        else:
            responses[q] = "random_text"  # default strategy for open text

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(responses, f, indent=2, ensure_ascii=False)

    print(f"✅ Created {filename}")


# ===================================
# Step 3: Generate a single response
# ===================================

def weighted_choice(options: dict):
    """Pick an option based on weights."""
    keys = list(options.keys())
    weights = list(options.values())
    if sum(weights) == 0:
        # fallback to uniform
        return random.choice(keys)
    return random.choices(keys, weights=weights, k=1)[0]


def generate_response(data, config):
    """Generate a payload ready for submission based on config."""
    payload = {}

    for q, meta in data.items():
        entry_id = meta["id"]

        if isinstance(config[q], dict):  # weighted multiple choice
            payload[entry_id] = weighted_choice(config[q])

        elif isinstance(config[q], str):
            rule = config[q]

            if rule.startswith("random_int:"):
                low, high = map(int, rule.split(":")[1].split("-"))
                payload[entry_id] = str(random.randint(low, high))

            elif rule == "random_text":
                payload[entry_id] = "".join(random.choices(string.ascii_letters, k=12))

            elif rule.startswith("fixed:"):
                payload[entry_id] = rule.split(":", 1)[1]

        else:
            payload[entry_id] = ""  # fallback

    return payload


# ================================
# Step 4: Submit response to Google
# ================================

def submit_response(form_url, payload):
    """Submit the payload to Google Form."""
    post_url = form_url.replace("viewform", "formResponse")
    r = requests.post(post_url, data=payload)
    if r.status_code == 200:
        print("✅ Response submitted successfully")
    else:
        print(f"⚠️ Submission failed: {r.status_code}")


# =====================
# Example Usage
# =====================

if __name__ == "__main__":
    FORM_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform"

    # Step 1: Parse and save schema
    form_data = parse_form(FORM_URL)
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(form_data, f, indent=2, ensure_ascii=False)
    print("✅ Saved form structure to data.json")

    # Step 2: Generate template if not exists
    if not os.path.exists("responses.json"):
        generate_responses_template(form_data)

    # Step 3: Load config & generate response
    with open("responses.json", "r", encoding="utf-8") as f:
        config = json.load(f)

    response = generate_response(form_data, config)
    print("Generated response:", response)

    # Step 4: Submit (uncomment when ready)
    # submit_response(FORM_URL, response)
