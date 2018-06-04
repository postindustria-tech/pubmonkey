import { HTTPService } from '../service'
import { LineItemModel } from '../model'

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
            .then(data => LineItemModel.createFromHTML(data, id).toJSON())
    }

}

export { BackgroundController }
