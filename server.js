//server set up
const { raw } = require('body-parser');
const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.static('public'));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


//creating Handler class (room type will extend from this)
class roomHandler{
    constructor(successiveHandler = null){
        this.successiveHandler = successiveHandler;
    }
    
    handle(request){
        if(this.successiveHandler)
        {
            return this.successiveHandler.handle(request);
        }        
        else
        {
            return {
                accepted : false,
                message: "Bid rejected. Please enter a different bid."
            };
        }
    }
}

//room types extending from initial room handler
class SuiteHandler extends roomHandler{
    constructor(){
        super();
        this.price = 280;
        this.availableRooms = 10;
    }

    handle(request){
        if(this.availableRooms === 0){
            return{
                accepted:false,
                message: "Bid rejected. Sorry, no more suites available to book!"
            };
        }

        if(request.bid >= this.price && this.availableRooms > 0)
        {
            this.availableRooms--;
            return{
                accepted: true,
                message: "Bid accepted. Suite room booked!"
            };
        }
        
        else
        {
            return super.handle(request);
        }
    }
}

class DeluxeHandler extends roomHandler{
    constructor(successiveHandler){
        super(successiveHandler);
        this.priceMin = 150;
        this.priceMax = 280;
        this.availableRooms = 15;
    }

    handle(request){
        if(this.availableRooms === 0){
            return{
                accepted:false,
                message: "Bid rejected. Sorry, no more deluxe rooms available to book!"
            };
        }
        if((request.bid >= this.priceMin && request.bid < this.priceMax || (this.successiveHandler && this.successiveHandler.availableRooms === 0 && request.bid >= this.priceMin)) && this.availableRooms > 0)
        {
            this.availableRooms--;
            return{
                accepted: true,
                message: "Bid accepted. Deluxe room booked!"
            };
        }
        else
        {
            return super.handle(request);
        }
    }
}

class StandardHandler extends roomHandler{
    constructor(successiveHandler){
        super(successiveHandler);
        this.priceMin = 80;
        this.priceMax = 149;
        this.availableRooms = 45;
    }

    handle(request){
        if(this.availableRooms === 0){
            return{
                accepted:false,
                message: "Bid rejected. Sorry, no more standard rooms available to book!"
            };
        }
        if((request.bid >= this.priceMin && request.bid < this.priceMax || (this.successiveHandler && this.successiveHandler.availableRooms === 0 && request.bid >= this.priceMin)) && this.availableRooms > 0)
        {
            this.availableRooms--;
            return{
                accepted: true,
                message: "Bid accepted. Standard room booked!"
            };
        }
        else
        {
            return super.handle(request);
        }
    }
}

//chaining...
const suiteHandler = new SuiteHandler();
const deluxeHandler = new DeluxeHandler(suiteHandler);
const standardHandler = new StandardHandler(deluxeHandler);

const allRoomsSoldOut = () => {
    return suiteHandler.availableRooms === 0 &&
    deluxeHandler.availableRooms === 0 &&
    standardHandler.availableRooms === 0;
};

app.post('/bid', (req, res) => {
    if(allRoomsSoldOut()){
        res.send({
            accepted:false,
            message: "Sorry, all rooms are sold out!"
        });
    }
    
    else{
        const result = standardHandler.handle(req.body);
        res.send(result);
    }
});

app.get('/availability', (req, res) => {
    res.json({
        suites: suiteHandler.availableRooms,
        deluxe: deluxeHandler.availableRooms,
        standard: standardHandler.availableRooms
    });
});
