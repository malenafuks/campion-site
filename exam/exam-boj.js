# Create the open-answer 300-question JSON using the required filename.
import json, random

random.seed(42)

base_items = [
    ("Opisz prawidłowe prowadzenie konia na uwiązie.",
     ["po lewej stronie","przy łopatce","pętle w dłoni","nie owijać uwiąz"],
     ["bez szarpania","dystans","kontakt głosowy"],
     ["owinięty wokół ręki","ciągnąć za karabińczyk"]),
    ("Jak bezpiecznie przejść za zadem konia?",
     ["bardzo blisko z ręką","albo 2–3 m"],
     ["kontakt głosem","zapowiedz ruch"],
     ["około 1 m za zadem"]),
    ("Jak przeprowadzić konia przez bramkę lub drzwi boksu?",
     ["wprowadzamy przód","odwracamy się twarzą do konia","zamykać spokojnie"],
     ["kontrola uwiązu","bez pośpiechu"],
     ["wpuścić samego","ciągnąć do środka tyłem"]),
    ("Jak przywiązać konia na myjce lub w stajni?",
     ["stały punkt","szybki węzeł","nie do wędzidła"],
     ["odpowiednia długość uwiązu","wysokość głowy"],
     ["ruchomy element","do wędzidła"]),
    ("Jak bezpiecznie podać smakołyk z ręki?",
     ["otwarta dłoń","palce złączone"],
     ["spokojnie","nisko przed pyskiem"],
     ["trzymać w palcach","zaciśnięta pięść"]),
    ("Co zrobić, gdy koń nadepnie na uwiąz?",
     ["nie szarpać","poprosić o krok","zwolnić napięcie"],
     ["spokój","bezpieczeństwo"],
     ["szarpnąć mocno","uderzyć w pierś"]),
    ("Opisz prawidłowe czyszczenie kopyta kopystką.",
     ["od piętki do palca","rowki przy strzałce","nie uszkadzać strzałki"],
     ["wyjąć kamienie","kontrola zapachu"],
     ["skrobać po strzałce","dowolny kierunek"]),
    ("Jak często sprawdzać kopyta w stajni?",
     ["codziennie","przed i po pracy"],
     ["po padoku w błocie","po wyjściiu z boksu"],
     ["raz w tygodniu wystarczy"]),
    ("Kiedy chłodzić nogi po pracy?",
     ["po intensywnym wysiłku","10–20 minut chłodzenie"],
     ["zimna woda","cold pack"],
     ["zawsze po spacerze","nigdy nie chłodzić"]),
    ("Jak przygotować konia do kąpieli na myjce?",
     ["przywiązać szybkim węzłem","ciepła woda","omijać uszy i twarz"],
     ["szampon koński","spokój"],
     ["do wędzidła","zimna woda na głowę"]),
    ("Kiedy i jak regulować popręg?",
     ["po osiodłaniu","po wsiadaniu","stabilnie","nie utrudnia oddechu"],
     ["sprawdzić kilka razy","po rozprężeniu"],
     ["maksymalnie dokręcić","tylko raz"]),
    ("Jak dopasować wysokość wędzidła?",
     ["1–2 fałdki"],
     ["komfort","stabilność"],
     ["3–4 fałdki","brak fałdek"]),
    ("Co zrobić przed zdjęciem ogłowia?",
     ["założyć kantar","uwiąz"],
     ["kontrola po zdjęciu"],
     ["zdjąć bez kantara"]),
    ("Jak ocenić dopasowanie siodła w spoczynku?",
     ["równy kontakt paneli","wolny kanał","brak mostkowania","nie na kłąb"],
     ["symetria"],
     ["wąski kanał","docisk przodu"]),
    ("Jak ustawić kask na głowie jeźdźca?",
     ["nisko na czole","pasek zapięty","nie przemieszcza się"],
     ["dopasowane wkładki"],
     ["luźny pasek","przechylony na tył"]),
    ("Jaka długość puślisk na płaskim dla przeciętnego jeźdźca?",
     ["strzemię do kostki"],
     ["indywidualne dopasowanie"],
     ["znacznie krócej","znacznie dłużej"]),
    ("Jak poprawnie założyć ochraniacze/owijki na nogi?",
     ["równo bez fałd","zapięcia do tyłu","prawidłowy naciąg"],
     ["czyste nogi","suchy włos"],
     ["bardzo ciasno","zapięcia do przodu"]),
    ("Jak sprawdzić dopasowanie nachrapnika?",
     ["1–2 palce luzu","na kości nosa"],
     ["nie uciska tkanek miękkich"],
     ["bez luzu","3–4 palce luzu"]),
    ("Jakie są podstawowe chody konia?",
     ["stęp","kłus","galop"],
     ["rytm"],
     ["inochód","cwał"]),
    ("Na czym polega półparada?",
     ["dosiad łydka ręka","krótka pomoc","zebranie uwagi"],
     ["równowaga"],
     ["mocne szarpnięcie wodzą"]),
    ("Jak utrzymać równowagę w kłusie anglezowanym?",
     ["rytm","biodra podążają","tułów stabilny","łydka spokojna"],
     ["na zewnętrzną wstajemy"],
     ["patrzeć w dół","wstać jak najwyżej"]),
    ("Jakie są zasady mijania na ujeżdżalni?",
      ["lewy do lewego","szybszy ustępuje wolniejszemu","zachować odstęp"],
      ["zapowiadanie zmian"],
      ["brak zasad"]),
    ("Jak sygnalizować zatrzymanie na placu?",
     ["głos lub sygnał","zejść z toru","powoli zatrzymać"],
     ["kontakt wzrokowy"],
     ["nagłe stanie na ścianie"]),
    ("Co oznacza impuls w jeździe?",
     ["energia z zadu do przodu","równowaga","rytm"],
     ["aktywność zadnich"],
     ["sama szybkość"]),
    ("Co robi zewnętrzna wodza na łuku?",
     ["stabilizuje łopatkę","reguluje tempo","promień skrętu"],
     ["kontrola kontaktu"],
     ["zagina szyję do wewnątrz"]),
    ("Jak przygotować się do skoku małej przeszkody?",
     ["ustabilizować tempo","linia prosta","półsiad","ręka elastyczna"],
     ["wzrok do przodu"],
     ["przyspieszyć mocno","patrzeć w drąg"]),
    ("Jaki rodzaj paszy ograniczyć w dni wolne od pracy?",
     ["pasza treściwa"],
     ["siano do woli","kaloryczność"],
     ["ograniczyć wodę"]),
    ("Dlaczego stały dostęp do paszy objętościowej jest ważny?",
     ["stabilizuje przewód pokarmowy","mniejsze ryzyko wrzodów"],
     ["produkcja śliny"],
     ["bo koń mniej pije"]),
    ("Kiedy nie podawać treściwej po pracy?",
     ["gdy tętno i oddech nie wróciły do normy","najpierw woda małe porcje"],
     ["odpoczynek"],
     ["zawsze można od razu"]),
    ("Podaj orientacyjne parametry spoczynkowe konia.",
     ["tętno 28–44","oddechy 8–16","temperatura 37,2–38,3"],
     ["widełki"],
     ["tętno 70–90","temp 39–40"]),
    ("Wymień objawy kolki wymagające reakcji.",
     ["niepokój","turlanie","brak odchodów","pocenie","brak apetytu"],
     ["patrzenie na boki"],
     ["ziewanie po poidole"]),
    ("Objawy ochwatu to…",
     ["gorące kopyta","bolesność","postawa odciążająca przód"],
     ["sztywność"],
     ["zimne kopyta i brak bólu"]),
    ("Co zrobić przy podejrzeniu udaru cieplnego?",
     ["schłodzić","cień","małe porcje wody","monitorować parametry"],
     ["zdjąć sprzęt"],
     ["wystawić na słońce"]),
    ("Jak zabezpieczyć apteczkę stajenną?",
     ["oznaczona","uzupełniana","dostępna","poza zasięgiem dzieci"],
     ["lista kontaktów"],
     ["bez opisu w siodlarni"]),
]

variants = [
    "W kilku zdaniach: {}",
    "Krótko i rzeczowo: {}",
    "Instrukcja dla początkującego: {}",
    "Wymień główne zasady: {}",
    "Co jest kluczowe? {}",
    "{}",
]

def model_from_require(req):
    if "pasza treściwa" in req:
        return "Ograniczamy paszę treściwą; siano zwykle do woli."
    if "od piętki do palca" in req:
        return "Czyścimy od piętki do palca, rowkami przy strzałce; strzałki nie skrobiemy."
    if "1–2 fałdki" in req:
        return "Ustawiamy wędzidło tak, by były 1–2 delikatne fałdki."
    if "1–2 palce luzu" in req:
        return "Między nachrapnikiem a kością nosa powinny mieścić się 1–2 palce."
    if "po osiodłaniu" in req:
        return "Sprawdzamy popręg po osiodłaniu i po wsiadaniu; stabilnie, bez utrudniania oddechu."
    if "stęp" in req and "kłus" in req and "galop" in req:
        return "Podstawowe chody: stęp, kłus, galop."
    if "pętle w dłoni" in req:
        return "Prowadzimy po lewej przy łopatce; uwiąz w pętlach, nie owijamy wokół ręki."
    if "stały punkt" in req and "szybki węzeł" in req:
        return "Przywiązujemy do stałego punktu szybkim węzłem; nigdy do wędzidła."
    return "Kluczowe elementy: " + ", ".join(req) + "."

questions = []
qid = 1
while qid <= 300:
    for base_q, req, good, forbid in base_items:
        for v in variants:
            if qid > 300: break
            q_text = v.format(base_q)
            questions.append({
                "id": qid,
                "question": q_text,
                "rubric": {"require": req, "good": good, "forbid": forbid},
                "modelAnswer": model_from_require(req)
            })
            qid += 1
        if qid > 300: break

path = "/mnt/data/boj-questions.json"
with open(path, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

path
