import sys
fname = sys.argv[1]

class Unit(object):
    def __init__(self, id, n, hp, immune, weak, init, dtyp, dmg, side):
        self.id = id
        self.n = n
        self.hp = hp
        self.immune = immune
        self.weak = weak
        self.init = init
        self.dtyp = dtyp
        self.dmg = dmg
        self.side = side
        self.target = None
    def power(self):
        return self.n * self.dmg
    def dmg_to(self, v):
        if self.dtyp in v.immune:
            return 0
        elif self.dtyp in v.weak:
            return 2*self.power()
        else:
            return self.power()

units = []
for line in open(fname).read().strip().split('\n'):
    if 'Immune System' in line:
        next_id = 1
        side = 0
    elif 'Infection' in line:
        next_id = 1
        side = 1
    elif line:
        words = line.split()
        n = int(words[0])
        hp = int(words[4])
        if '(' in line:
            resists = line.split('(')[1].split(')')[0]
            immune = set()
            weak = set()
            def proc(s):
                # {immune,weak} to fire, cold, pierce
                words = s.split()
                assert words[0] in ['immune', 'weak']
                for word in words[2:]:
                    if word.endswith(','):
                        word = word[:-1]
                    (immune if words[0]=='immune' else weak).add(word)
            if ';' in resists:
                s1,s2 = resists.split(';')
                proc(s1)
                proc(s2)
            else:
                proc(resists)
        else:
            immune = set()
            weak = set()
        init = int(words[-1])
        dtyp = words[-5]
        dmg = int(words[-6])
        name = '{}_{}'.format({1:'Infection', 0:'System'}[side], next_id)
        units.append(Unit(name, n, hp, immune, weak, init, dtyp, dmg, side))
        next_id += 1

def battle(original_units, boost):
    units = []
    for u in original_units:
        new_dmg = u.dmg + (boost if u.side==0 else 0)
        units.append(Unit(u.id, u.n, u.hp, u.immune, u.weak, u.init, u.dtyp, new_dmg, u.side))
    while True:
        units = sorted(units, key=lambda u: (-u.power(), -u.init))
        for u in units:
            assert u.n > 0
        chosen = set()
        for u in units:
            def target_key(v):
                return (-u.dmg_to(v), -v.power(), -v.init)

            targets = sorted([v for v in units if v.side != u.side and v.id not in chosen and u.dmg_to(v)>0],
                    key=target_key)

            if targets:
                u.target = targets[0]
                assert targets[0].id not in chosen
                chosen.add(targets[0].id)

        units = sorted(units, key=lambda u:-u.init)
        any_killed = False
        for u in units:
            if u.target:
                dmg = u.dmg_to(u.target)
                killed = min(u.target.n, dmg//u.target.hp)
                if killed > 0:
                    any_killed = True
                u.target.n -= killed

        units = [u for u in units if u.n > 0]
        for u in units:
            u.target = None

        if not any_killed:
            return 1,n1

        n0 = sum([u.n for u in units if u.side == 0])
        n1 = sum([u.n for u in units if u.side == 1])
        if n0 == 0:
            return 1,n1
        if n1 == 0:
            return 0,n0
print(battle(units, 0)[1])

boost = 0
while True:
    winner, left = battle(units, boost)
    if winner == 0:
        print(boost, left)
        break
    boost += 1
