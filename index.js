`use strict`;
import express from "express";
import fs, { read } from "fs";
import path from "path";
import { json } from "stream/consumers";
import { ReadStream } from "tty";
import { fileURLToPath } from "url";
const app = express();
const PORT = 3000;
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "./users.json");


// user router 
const userRouter = express.Router();

/*============================================*/
app.use("/user", userRouter);
/*============================================*/

//showing the users in included in the file."this step is beyond the scope of the assignment just to double check other required requests"  
userRouter.get("/viewUsers", (req, res) => {
    const readStream = fs.createReadStream(filePath, { encoding: "utf-8" });

    let usersFromFile = "";
    readStream.on("data", (chunk) => {
        usersFromFile += chunk;
    });

    readStream.on("end", () => {
        return res.status(200).json(JSON.parse(usersFromFile));
    });
});

// adding new user to the json file
userRouter.post("/addUser", (req, res) => {
    const { name, age, email } = req.body;
    const readStream = fs.createReadStream(filePath);

    // reading the file before adding the new user 
    let usersInFile = "";
    readStream.on("data", (chunk) => {
        usersInFile += chunk;
    });

    readStream.on("end", () => {
        usersInFile = JSON.parse(usersInFile);
        // check if the user exist
        const userExist = usersInFile.find((user) =>
            user.email === email
        );
        if (userExist) {
            return res.status(409).json("user already exists");
        }


        const id = usersInFile.length + 1;
        usersInFile.push({ id, name, age, email });


        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(JSON.stringify(usersInFile), (error) => {
            if (!error) {
                return res.status(201).json("user added successfully");
            }
            return res.status(500).json("Something went wrong");
        });

    });

});

//updating existing user's name/age/email by their "id"
userRouter.patch("/updateUser/:id", (req, res) => {
    const { id } = req.params;
    const { name, age, email } = req.body;

    const readStream = fs.createReadStream(filePath);
    let usersFromFile = "";
    readStream.on("data", (chunk) => {
        usersFromFile += chunk;
    });
    readStream.on("end", () => {

        usersFromFile = JSON.parse(usersFromFile);
        const isUserexists = usersFromFile.find((user) =>
            user.id == id
        );
        if (!isUserexists) {
            return res.status(501).json("User id not found.");
        }
        const updatedUsers = usersFromFile.map((user) => {
            if (user.id == id) {
                if (name) user.name = name;
                if (age) user.age = age;
                if (email) user.email = email;
            }
            return user;
        });
        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(JSON.stringify(updatedUsers), (error) => {
            if (!error) {
                return res.status(200).json("User updated successfully");
            }
            return res.status(500).json("Something went wrong when writing to the json file");
        });
    });

});

userRouter.delete("/deleteUser/:id?", (req, res) => {
    const { id } = req.params;
    const { idFromBody } = req.body;

    if (!id && !idFromBody) {
        return res.status(400).json("please provide the Id of the user");
    }
    const userIdToDelete = id || idFromBody;

    const readStream = fs.createReadStream(filePath);
    let usersFromFile = "";
    readStream.on("data", (chunk) => {
        usersFromFile += chunk;
    });
    readStream.on("end", () => {
        usersFromFile = JSON.parse(usersFromFile);

        const updatedUsers = usersFromFile.filter((user) =>
            user.id != userIdToDelete
        );
        //how do I keep track of an Id that is already deleted b/c when I commite the code below it does't allow me to delted another user ?
        // if (updatedUsers.length === usersFromFile.length) {
        //     return res.status(501).json("User id not found");
        // }

        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(JSON.stringify(updatedUsers), (error) => {
            if (!error) {
                return res.status(201).json("User deleted successfully");
            }
            return res.status(500).json("something went wrong");
        });
        writeStream.end();
    });

});

userRouter.get("/getUserByName", (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(500).json(`please provide a name in the url ex:"/getUserByName?name= targeted name" `);
    }

    const readStream = fs.createReadStream(filePath);
    let usersFromFile = "";
    readStream.on("data", (chunk) => {
        usersFromFile += chunk;
    });

    readStream.on("end", () => {

        usersFromFile = JSON.parse(usersFromFile);
        const userExist = usersFromFile.find((user) => user.name == name);
        if (!userExist) {
            return res.status(404).json("User name not found.");
        }
        return res.status(200).json(userExist);
    });


});

userRouter.get("/getUserById/:id", (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json("please provide the Id of the user");
    }
    const readStream = fs.createReadStream(filePath);
    let usersFromFile = "";
    readStream.on("data", (chunk) => {
        usersFromFile += chunk;
    });

    readStream.on("end", () => {
        usersFromFile = JSON.parse(usersFromFile);
        const userExist = usersFromFile.find((user) => user.id == id);
        if (!userExist) {
            return res.status(404).json("User name not found.");
        }
        return res.status(200).json(userExist);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


