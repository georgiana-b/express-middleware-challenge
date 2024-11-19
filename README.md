# express-middleware-challenge
Middleware for processing orders

To run the app:

    npm run dev

It is using an SQLite database and it should be created on startup.
There are a few endpoints:
curl -X GET http://localhost:3000/orders/download - downloads all the orders from Service A
curl -X GET http://localhost:3000/orders/retrieve  - see all the downloaded orders
curl -X GET http://localhost:3000/orders/process?date=  - process orders given a date (default to      today) and create bills based on the date (if the date is moday also includes weekly orders, if the date is the 1st of the month also includes montly orders)
curl -X GET http://localhost:3000/orders/bills   - see all the bills that have been created from the orders  (this is just for ease of exploring the functionality ideally it should be a separate restful endpoint with it's own date query parameter)

If I had more time I would create a more complete RESTful schema where Customer, Item and BillyingCycle and Bill are all separate models with the respective associations.

Then we could query more smootly all the customer orders, the customer active billing cycles and exiting bills. We could also calculate upcoming bills based on the billing cycle. 

And have more restful endpoints like:

/customer/:id/orders
/customer/:id/billingcycles
/customer/:id/bills

/oders to view all the orders

We can also technically create a more elegant sollution if Order would be related to a Bill through BillingCycle to kind of check directly if the order already has a processed bill for the day and only process it again if it doesn't.

I actually started creating the models for this but then I realised it would be too much to do in the assigned timeframe. 
