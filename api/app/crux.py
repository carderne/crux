"""
Solve the Double-Crux pairing problem
with Mixed-Integer Linear Programming (MILP)
via PuLP

https://github.com/coin-or/pulp
Install if needed:
```
pip install pulp
```
"""

from operator import itemgetter

import pulp as p

from .models import Statements, People, Assignment, Pairings

STRATS = (0, 1, 2)

COLORS = [
    "#1f78b4",
    "#33a02c",
    "#e31a1c",
    "#ff7f00",
    "#6a3d9a",
    "#b15928",
    "#a6cee3",
    "#b2df8a",
    "#fb9a99",
    "#fdbf6f",
    "#cab2d6",
    "#ffff99",
]


def argmax(iterable):
    return max(enumerate(iterable), key=lambda x: x[1])[0]


def calculate(
    statements: Statements,
    people: People,
) -> Pairings:
    arr = people.arr
    names = people.names
    pairs = make_pairs(arr)
    pairings = {}
    for i, pair in enumerate(pairs):
        c = COLORS[i]
        s = statements[argmax(abs(a - b) for a, b in zip(*itemgetter(*pair)(arr)))]
        for x in pair:
            pairings[names[x]] = Assignment(statement=s, color=c)
    return pairings


def make_pairs(
    arr: list[list[int]],
    strat: int = 0,
    verbose: int = 0,
) -> list[tuple[int, int]]:
    f"""
    Solve the given array with the supplied strategy,
    printing the solution and returning the pairs.

    Parameters
    ----------
    arr :
        each element in the first dimension (row) represents a person
        there must be an even number of people!
        each element within that is their 'rating' on a question

        Example with four people rating three questions:
        arr = [
            [1, 1, 2],
            [3, 5, 3],
            [1, 1, 3],
            [5, 3, 2],
        ]

    strat :
        must be one of {STRATS}

        different strategies
        0: max-max: make pairs with highest max disagreement
        1: max-min: make pairs with highest min disagreement
        2: max-avg: make pairs with highest avg disagreement

    verbose :
        must be one of (0, 1, 2)
        0: no console output
        1: print pairing summary
        2: print the solver output

    Returns
    -------
    pairs :
        list of pairs
        Example:
        [(0, 1), (2, 3)]
    """

    ps = len(arr)
    qs = len(arr[0])

    assert strat in STRATS, f"'strat' must be one of {STRATS}"
    assert ps % 2 == 0, f"len(arr) must be even but got {len(arr)=}"
    assert all(len(a) == qs for a in arr), "All in arr must have same length"

    # N is the iterator for people
    N = range(ps)
    # Q is the iterator for questions
    Q = range(qs)

    prob = p.LpProblem("Problem", p.LpMaximize)

    # a sparse binary matrix that maps from:to:question
    # eg if person 1 disagrees with person 3 on question 0: [1][3][0]
    # it is only 1 in the place where that disagreement happens
    # 0 everywhere else
    match = p.LpVariable.dicts("match", (N, N, Q), 0, 1, cat="Integer")

    # for each person
    for i in N:
        # they never choose themselves
        prob += p.lpSum([match[i][i][q] for q in Q]) == 0

        if strat < 2:
            # they can only disagree with one person on one question
            prob += p.lpSum([match[i][j][q] for j in N for q in Q]) == 1

        if strat == 2:
            # the max-avg problem could be formulated more easily without
            # the Q axis on match
            # but done this way to keep the whole thing as one model
            for j in N:
                for q in Q:
                    # first force either all 1 or all 0 on the
                    # Q axis for a particular partner
                    prob += match[i][j][0] == match[i][j][q]
            # and then limit the total to be equal to the number of Q's
            # these two constraints together basically eliminaate the Q axis
            prob += p.lpSum([match[i][j][q] for j in N for q in Q]) == qs

    # the disagreements must be reciprocal
    # i.e. if 1-2:0 then must also have 2-1:0
    for i in N:
        for j in N:
            for q in Q:
                prob += match[i][j][q] == match[j][i][q]

    # One 'x' value for each person
    x = p.LpVariable.dicts("x", N)
    xx = p.LpVariable.dicts("xx", (N, N))
    for i in N:
        # The 'x' for each person is the sum of their differences
        # but those differences are only counted in the one place where
        # match[i][j][q] == 1
        prob += x[i] == p.lpSum(
            [(arr[i][q] - arr[j][q]) * match[i][j][q] for j in N for q in Q]
        )

        # add extra constraints to max the min disagreement
        if strat == 1:
            for j in N:
                prob += xx[i][j] == p.lpSum(
                    [(arr[i][q] - arr[j][q]) * match[i][j][q] for q in Q]
                )
                prob += xx[i][j] <= min(abs(arr[0][q] - arr[1][q]) for q in Q)

    # But we want the asbolute value!
    # Source for absolute value method:
    # http://lpsolve.sourceforge.net/5.5/absolute.htm
    xabs = p.LpVariable.dicts("xabs", N)
    B = p.LpVariable.dicts("B", N, 0, 1, cat="Integer")
    M = (max(max(arr[i]) for i in N) - min(min(arr[i]) for i in N)) * 2
    if strat == 2:
        M *= qs
    for i in N:
        prob += x[i] + M * B[i] >= xabs[i]
        prob += -x[i] + M * (1 - B[i]) >= xabs[i]
        prob += x[i] <= xabs[i]
        prob += -x[i] <= xabs[i]

    # And then the maximization is based on this new absolute value
    # This is the objective function
    prob += p.lpSum(xabs)

    solve_msg = verbose == 2
    status = prob.solve(p.PULP_CBC_CMD(msg=solve_msg))
    assert p.LpStatus[status] == "Optimal", "Optimal solution not found!"

    # Display pairings, and the question(s) the solution was based on
    if verbose:
        print(f"Pairs for {strat=}")
    pairs = []
    for i in N:
        for j in N[i:]:
            if any(m := [match[i][j][q].varValue for q in Q]):
                pairs.append((i, j))
                if verbose:
                    print(f"{i}-{j}:", [q for q, x in enumerate(m) if x])
    if verbose:
        print()
    return pairs


if __name__ == "__main__":
    arr = [[1, 1, 2], [3, 5, 3], [1, 1, 3], [5, 3, 2], [1, 1, 1]]
    for i in range(3):
        make_pairs(arr, i, verbose=1)
