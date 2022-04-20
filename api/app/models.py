from pydantic import BaseModel, constr, Field


class Message(BaseModel):
    message: str = Field(..., example="Health OK!")


class Assignment(BaseModel):
    statement: str = Field(..., example="Rationalism is good")
    color: str = Field(..., example="#FF0000")


IdType = constr(regex=r"[a-z]{6}")
PairingsDict = dict[IdType, Assignment]


class Pairings(BaseModel):
    __root__: PairingsDict = Field(
        ..., example={"username": {"statement": "This is healthy", "color": "#FF0000"}}
    )


StatementsList = list[str]


class Statements(BaseModel):
    __root__: StatementsList = Field(..., example=["A", "B", "C"])

    def __getitem__(self, item):
        return self.__root__[item]


PeopleDict = dict[IdType, list[int]]


class People(BaseModel):
    __root__: PeopleDict = Field(
        ..., example={"username": [1, 2, 2], "personto": [5, 4, 4]}
    )

    @property
    def arr(self):
        # return [d for d in self.__root__.values()]
        return list(self.__root__.values())

    @property
    def names(self):
        return list(self.__root__.keys())
