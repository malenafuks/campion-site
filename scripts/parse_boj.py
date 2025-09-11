import re, json, argparse, sys, urllib.request, tempfile, os
from pdfminer.high_level import extract_text

def clean(s:str)->str:
    return re.sub(r"\s+", " ", s).strip()

def parse_questions(txt:str):
    t = txt.replace("\r", "")
    t = re.sub(r"~\s*\d+\s*~", "", t)  # usuń znaczniki stron
    # podział po liniach "NN. ..."
    blocks = re.split(r"\n\s*(\d+)\.\s", t)
    out = []
    for i in range(1, len(blocks), 2):
        try:
            num = int(blocks[i])
        except:
            continue
        rest = blocks[i+1]
        first_nl = rest.find("\n")
        if first_nl == -1:
            qtext = clean(rest)
            after = ""
        else:
            qtext = clean(rest[:first_nl])
            after = rest[first_nl+1:]

        # do następnego numeru
        nxt = re.search(r"\n\s*\d+\.\s", after)
        section = after[:nxt.start()] if nxt else after

        # preferuj sekcję "Odpowiedź:"
        mo = re.search(r"(?:Odpowiedź|ODPOWIEDŹ)\s*:\s*(.*)", section, flags=re.DOTALL)
        if mo:
            answer = mo.group(1).strip()
        else:
            answer = section.strip()

        # wykryj podpunkty a) b) c) ...
        subpoints = []
        lines = [ln.rstrip() for ln in answer.splitlines()]
        sub_re = re.compile(r"^\s*([a-ząćęłńóśżź])\.\s+(.*)$", re.IGNORECASE)
        for ln in lines:
            m = sub_re.match(ln)
            if m:
                subpoints.append(m.group(2).strip())
            else:
                if subpoints and ln.strip():
                    subpoints[-1] += " " + ln.strip()

        if subpoints:
            mode = "choices"
            options = [{"text": clean(sp), "correct": True} for sp in subpoints if clean(sp)]
        else:
            mode = "statements"
            parts = re.split(r"(?<=[\.\?!])\s+(?=[A-ZŁŚŻĆŹ0-9])", answer)
            parts = [clean(p) for p in parts if clean(p)]
            options = [{"text": p, "correct": True} for p in parts]

        if options:
            out.append({
                "number": num,
                "mode": mode,
                "text": qtext,
                "options": options,
                "explanation": ""
            })

    out.sort(key=lambda x: x["number"])
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    # pobierz PDF do pliku tymczasowego
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        urllib.request.urlretrieve(args.pdf, tmp.name)
        pdf_path = tmp.name

    text = extract_text(pdf_path)
    questions = parse_questions(text)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Zapisano {len(questions)} pytań do {args.out}")

if __name__ == "__main__":
    sys.exit(main())

