import sys

def make_list(filen):
  messagesfile = open(filen,"r")
  messages = messagesfile.read()
  messagelist = list()
  for line in messages.split("\n"):
    try:
     if line[-1] != "!" and line[-1] != "?" and line[-1] != ".":
       line += "."
     messagelist.append(line)
    except:
      pass
  messagesfile.close()
  words_list = list()
  for line in messagelist:
    f = line.split(" ")
    for word in f:
      words_list.append(word)
  return words_list

import random
def generate_quote(start, words_list):
  sentence = start
  end = False
  while end == False:
    index_list = list()
    for i, j in enumerate(words_list):
     if j.lower() == start.lower():
        index_list.append(i)
    try:
     index = random.choice(index_list)
     start = str(words_list[index+1])
     try:
       if "!" == start[-1] or "." == start[-1] or "?" == start[-1]:
          end = True
       sentence += " "+start
     except:
       pass
    except:
     return "Starting word not found"
  return sentence

print(generate_quote(sys.argv[1], make_list("quotes.txt")))
