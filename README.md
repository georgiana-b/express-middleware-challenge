# express-middleware-challenge
Middleware for processing orders

If I had more time I would create a more complete RESTful schema where Customer, Item and BillyingCycle and Bill are all separate models with the respective associations.

Then we could query more smootly all the customer orders, the customer active billing cycles and exiting bills. We could also calculate upcoming bills based on the billing cycle. 

And have more restful endpoints like:

/customer/:id/orders
/customer/:id/billingcycles
/customer/:id/bills

/oders to view all the orders

We can also technically create a more elegant sollution if Order would be related to a Bill through BillingCycle to kind of check directly if the order already has a processed bill for the day and only process it again if it doesn't.

I actually started creating the models for this but then I realised it would be too much to do in the assigned timeframe. 
