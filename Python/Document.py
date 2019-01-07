class DocumentObj:
    name = ""
    user_1 = ""
    user_2 = ""
    content = ""

    def __init__(self, name, user_1, user_2, content):
        self.content = content
        self.user_1 = user_1
        self.user_2 = user_2
        self.name = name

    def getuser_1(self):
        return self.user_1

    def getuser_2(self):
        return self.user_2

    def getname(self):
        return self.name

    def appendtocontent(self, new_text):
        self.content = "%s\n\n%s" % (self.content, new_text)

    def getcontent(self):
        return self.content
