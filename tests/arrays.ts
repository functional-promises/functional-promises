import FP from '../index'

FP.chain()
.delay(500)
.filter(x => x > 10)
.map