import sys, argparse, json

parser = argparse.ArgumentParser(description='MoPorter template replicator',
            usage='\n$ python %(prog)s [-h] [--hybid] template_file data_file > out.json')

parser.add_argument('template', metavar='template_file', type=str, nargs=1, help='order template file. (e.g. template.json)')
parser.add_argument('data', metavar='data_file', type=str, nargs=1, help='macro data(can be JSON or CSV file, e.g. data.json)')
parser.add_argument('--hybid', action='store_true', dest='hybid', help='generate price keywords with a step 0.001')

args = parser.parse_args()

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

template = json.load(open(args.template[0]))
data = ''
data_file = args.data[0]
step = 0.001


if data_file[-5:] == '.json':
    data = json.load(open(data_file))
elif data_file[-4:] == '.csv':
    data = [float(x) for x in open(data_file, 'rU').readlines()]
else:
    print 'unsupported format of data file. only json and csv are allowed'
    sys.exit()

etalon = template['orders'][0]['lineItems'][0]
etalon_keyword = etalon['keywords'].replace('{special}', '{}')

fields_with_macros = [key for key, value in etalon.items() if type(value) == unicode and value.find('{bid}') != -1]

output = []
last_idx = len(data) - 1

for idx, bid in enumerate(data):
    item = etalon.copy()

    for key in fields_with_macros:
        item[key] = item[key].replace('{bid}', str(bid))

    if args.hybid:
        if idx == last_idx:
            item['keywords'] = etalon_keyword.format(sformat(bid))
        else:
            next = data[idx + 1]
            item['keywords'] = ''.join([etalon_keyword.format(x) for x in [sformat(x) for x in frange(bid, next, step)]])

    output.append(item)

template['orders'][0]['lineItems'] = output

print json.dumps(template, indent=4)
