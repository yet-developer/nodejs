# Admin 서비스 구성

* get('card/') : view.jade
* get('card/:id') : sign.jade
* get('card/new') : new.jade
    * post('card/new') 
    * get('card/:id')
* get('card/:id/edit') : edit.jade
    * post('card/:id/edit') 
    * get('card/:id')
* get('card/:id/delete') : delete.jade
    * post('card/:id/delete')

# 상용 서비스 구성

* get('coupon/') : main.jade
* get('coupon/:id') : detail.jade
* get('mechant/') : mechant.jade 
* get('mechant/:id') : store.jade