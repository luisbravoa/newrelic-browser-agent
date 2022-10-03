import { setup } from '../utils/setup'
import { wrapEvents } from '../../common/wrap/wrap-events'

const { baseEE } = setup()

describe('addEventListener options', () => {
    it('addEventListener options work when wrapped', () => {
        wrapEvents(baseEE)

        let handlerCallCount = 0
        let el = createAndAddDomElement()

        el.addEventListener('click', handler, { capture: true })
        el.addEventListener('click', handler, { capture: false })
        triggerEvent(el, 'click')

        // should have seen handler calls both phases
        expect(handlerCallCount).toEqual(2)

        el.removeEventListener('click', handler, false)
        triggerEvent(el, 'click')

        // should have seen handler call for capture
        expect(handlerCallCount).toEqual(3)

        el.removeEventListener('click', handler, true)
        triggerEvent(el, 'click')

        // should not have seen additional handler class
        expect(handlerCallCount).toEqual(3)
        
        function handler() { handlerCallCount++ }
    })
})

function triggerEvent(el, eventName) {
    let evt = document.createEvent('Events')
    evt.initEvent(eventName, true, false)
    el.dispatchEvent(evt)
}

function createAndAddDomElement(tagName = 'div') {
    var el = document.createElement(tagName)
    document.body.appendChild(el)
    return el
}