import sys, json

def frange(x, y, step):
    while x < y:
        yield x
        x = x + step

def sformat(value):
    value = str(value)[0:5]
    length = len(value)
    if (length < 5):
        value = value + '0' * (5 - length)
    return value

if len(sys.argv) < 3:
    print 'usage: ' + sys.argv[0] + ' template.json data.json > output.json\n\n'
    sys.exit()

template = json.load(open(sys.argv[1]))
data = ''
step = 0.001

if sys.argv[2][-5:] == '.json':
    data = json.load(open(sys.argv[2]))
elif sys.argv[2][-4:] == '.csv':
    data = [float(x) for x in open(sys.argv[2], 'rU').readlines()]
else:
    print 'unsupported format of data file. only json and csv are allowed'
    sys.exit()

etalon = template['orders'][0]['lineItems'][0]
etalon_keyword = etalon['keywords'].replace('{special}', '{}')

fields_with_macros = [key for key, value in etalon.items() if type(value) == unicode and value.find('{bid}') != -1]

output = []

for bid in data:
    item = etalon.copy()

    for key in fields_with_macros:
        item[key] = item[key].replace('{bid}', str(bid))

    # item.keywords = [etalon_keyword.format(x) for x in [sformat(x) for x in frange(bid, next, step)]]
    # @TODO define next value

    output.append(item)

template['orders'][0]['lineItems'] = output

print json.dumps(template, indent=4)
