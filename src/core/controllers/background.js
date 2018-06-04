import { HTTPService, StoreService } from '../services'
import { LineItemModel } from '../models'

const WEB_URL = 'https://app.mopub.com'

const BackgroundController = new class Background {
    getAllOrders() {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/query`)
    }

    getOrder(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/get?key=${id}`)
    }

    getLineItem(id) {
        return HTTPService.GET(`${WEB_URL}/advertise/line_items/${id}/edit/`)
            .then(data => LineItemModel.createFromHTML(data, id).toJSON()) //@TODO maybe it's not necessary to create instances for parsing only
    }

    getFromStore(...keys) {
        return StoreService.get(...keys)
    }

    setToStore(data) {
        return StoreService.set(data)
    }

    addToStore(data) {
        return StoreService.add(data)
    }
}

export { BackgroundController }
