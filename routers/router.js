const express = require('express')
const router = express.Router()
const sql = require('mssql');
const config = require("../dbConfig");
const {add} = require("nodemon/lib/rules");

//-------------------- Unit Start

router.get('/unit/view', async (req, res) => {
    await sql.connect(config, err => {
        if (err) console.log(err);
        const request = new sql.Request();
        request.query('SELECT UnitID, UnitName, ManagerName FROM Unit', (err, result) => {
            if (err) res.send({code: 412, message: 'errorrrrrrrrr'});
            res.send({code: 415, data: result.recordset});
        });
    });
});

router.post('/unit/add', (req, res) => {
    const {unitName, managerName} = req.body;
    const addToUnit = `INSERT INTO Unit (UnitName, ManagerName)
                        output inserted.UnitID, inserted.UnitName, inserted.ManagerName
                        VALUES (N'${unitName}', N'${managerName}')`
    const request = new sql.Request();
    request.query(addToUnit, (error, result) => {
        console.log('addToUnit error: ', error)
        // console.log(result)
        if (error) res.send({code: 412, message: error})
        else res.send({code: 415, data: result.recordset[0]})
    })
})

router.put('/unit/update/:id', (req, res) => {
    const {unitName, managerName} = req.body.updatedData;
    const {id} = req.params
    const updateUnit = `UPDATE Unit SET UnitName=N'${unitName}', ManagerName=N'${managerName}', ModifiedDate=getDate()
                        WHERE UnitID='${id}';`
    const request = new sql.Request();
    request.query(updateUnit, (error, result) => {
        if (error) res.send({code: 412, message: error})
        else res.send({code: 415, data: {key: parseInt(id), UnitName: unitName, ManagerName: managerName}})
    })
})

router.delete('/unit/:id/delete', (req, res) => {
    const unitId = req.params.id
    const deleteUnit = `DELETE FROM Unit WHERE UnitId='${unitId}'`
    const request = new sql.Request();
    request.query(deleteUnit, (error, result) => {
        if (error) res.send({code: 412, message: error})
        else res.send({code: 415})
    })
})

//-------------------- Unit End

//-------------------- MachineCategory Start

router.get('/machine/category/view', async (req, res) => {
    await sql.connect(config, err => {
        if (err) console.log(err);
        const request = new sql.Request();
        const getAllMachineCategories = `
                            SELECT M.MachineCategoryID, MachineType, MachineCode, CategoryName, CategoryCode, UnitName, UnitID , IsTimeEffective ,Counts
                            FROM MachineCategory M
                            left join (select count(*) Counts,MachineCategoryID from MachineRequest group by MachineCategoryID) MC
                            on M.MachineCategoryID=MC.MachineCategoryID
                            order by isnull(Counts,0) desc
                            `
        request.query(getAllMachineCategories, (err, result) => {
            console.log('machine category view error: ', err)
            // console.log('machine category view result: ', result)
            if (err) res.send({code: 412, message: 'errorrrrrrrrr'});
            else res.send({code: 415, data: result.recordset});
        });
    });
});

router.post('/machine/category/add', (req, res) => {
    const {
        machineType,
        machineCode,
        categoryName,
        categoryCode,
        unit,
        isTimeEffective,
    } = req.body;
    const addToMachineCategory = `INSERT INTO MachineCategory (MachineType, MachineCode, CategoryName, CategoryCode, UnitName, UnitID , IsTimeEffective, CreateBy)
                        output inserted.machineCategoryID, inserted.MachineType, inserted.MachineCode, inserted.CategoryName, inserted.CategoryCode, inserted.UnitName, inserted.UnitID, inserted.IsTimeEffective
                        VALUES (N'${machineType}', N'${machineCode}', N'${categoryName}', N'${categoryCode}', N'${unit.UnitName}', '${unit.key}', ${isTimeEffective}, '')`
    const request = new sql.Request();
    request.query(addToMachineCategory, (error, result) => {
        console.log('add machine category error', error)
        // console.log(result)
        if (error) res.send({code: 412, message: 'error'})
        else res.send({code: 415, data: result.recordset[0]})
    })
})

router.put('/machine/category/:id/update', (req, res) => {
    const {
        machineType,
        machineCode,
        categoryName,
        categoryCode,
        unit,
        isTimeEffective
    } = req.body;
    const {id} = req.params
    const updateMachineCategory = `UPDATE MachineCategory SET MachineType=N'${machineType}', MachineCode=N'${machineCode}',
                                    CategoryName=N'${categoryName}', CategoryCode=N'${categoryCode}', UnitName=N'${unit.UnitName}',
                                    UnitID='${unit.key}', IsTimeEffective=${isTimeEffective},
                                    ModifiedDate=getDate()
                                    output inserted.machineCategoryID, inserted.MachineType, inserted.MachineCode, inserted.CategoryName, inserted.CategoryCode, inserted.UnitName, inserted.UnitID, inserted.IsTimeEffective
                                    WHERE MachineCategoryID='${id}';`
    const request = new sql.Request();
    request.query(updateMachineCategory, (error, result) => {
        console.log('update error', error)
        if (error) res.send({code: 412, message: error})
        else res.send({code: 415, data: result.recordset[0]})
    })
})

router.delete('/machine/category/:id/delete', (req, res) => {
    const machineCategoryID = req.params.id
    const deleteUnit = `
                        DELETE FROM MachineCategoryPMItem WHERE MachineCategoryID='${machineCategoryID}'
                        DELETE FROM MachineCategory WHERE MachineCategoryID='${machineCategoryID}'
                        `
    const request = new sql.Request();
    request.query(deleteUnit, (error, result) => {
        console.log('delete error: ', error)
        if (error) res.send({code: 412, message: error})
        else res.send({code: 415, data: result})
    })
})

//-------------------- MachineCategory End

//-------------------- MachineCategoryPMItem Start

router.get('/machine/category/:id/item/view', async (req, res) => {
    await sql.connect(config, err => {
        if (err) console.log(err);
        const request = new sql.Request();
        const {id} = req.params
        const getMachineCategoryItems = `
            SELECT * FROM MachineCategoryPMItem
            WHERE MachineCategoryID='${id}'
        `
        request.query(getMachineCategoryItems, (err, result) => {
            console.log('machine category view error: ', err)
            // console.log('machine category view result: ', result)
            if (err) res.send({code: 412, message: 'errorrrrrrrrr'});
            else res.send({code: 415, data: result.recordset});
        });
    });
});

router.post('/machine/category/:id/item/add', (req, res) => {
    const {
        itemName,
        isActive,
        description,
    } = req.body;
    const {id} = req.params
    const addToMachineCategoryPMItem = `INSERT INTO MachineCategoryPMItem (ItemName, IsActive, Description, MachineCategoryID, CreateBy)
                                        output inserted.MachineCategoryPMItemID, inserted.ItemName, inserted.IsActive, inserted.Description, inserted.MachineCategoryID
                        VALUES (N'${itemName}', ${isActive}, N'${description}', '${id}', '')`
    const request = new sql.Request();
    request.query(addToMachineCategoryPMItem, (error, result) => {
        console.log('addToMachineCategoryPMItem error: ', error)
        // console.log('addToMachineCategoryPMItem result', result)
        if (error) res.send({code: 412, message: 'error'})
        else res.send({code: 415, data: result.recordset[0]})
    })
})

//-------------------- MachineCategoryPMItem End

//-------------------- Machine Start

router.get('/machine/view', async (req, res) => {
    await sql.connect(config, err => {
        if (err) console.log(err);
        const request = new sql.Request();
        const getAllMachines = `SELECT * FROM Machine`
        request.query(getAllMachines, (err, result) => {
            console.log('machine view error: ', err)
            // console.log('machine category view result: ', result)
            if (err) res.send({code: 412, message: 'errorrrrrrrrr'});
            else res.send({code: 415, data: result.recordset});
        });
    });
});

router.post('/machine/add', (req, res) => {
    const {
        machineCategory,
        machineCategoryID,
        machineName,
        machineCode,
        plate,
        driverName,
        model,
        company,
        serialNumber,
        chassisNumber,
        functionType,
        motorNumber,
        color,
        entryDateTime,
        isActive
    } = req.body;
    const addToMachine = `INSERT INTO Machine (MachineCategory, MachineCategoryID, MachineName, MachineCode, Plate, DriverName, Model, Company, SerialNumber, ChassisNumber, FunctionType, MotorNumber, Color, EntryDateTime, IsActive, CreateBy)
                            output inserted.MachineID, inserted.MachineCategory, inserted.machineCategoryID, inserted.MachineName, inserted.MachineCode, inserted.Plate, inserted.DriverName, inserted.Model, inserted.Company, inserted.SerialNumber, inserted.ChassisNumber, inserted.FunctionType, inserted.Color, inserted.EntryDateTime
                        VALUES (N'${machineCategory}', '${machineCategoryID}', N'${machineName}', N'${machineCode}', N'${plate}', N'${driverName}', N'${model}', N'${company}', N'${serialNumber}', N'${chassisNumber}', N'${functionType}', N'${motorNumber}', N'${color}', CAST('${entryDateTime}' AS datetime), ${isActive}, '')`
    const request = new sql.Request();
    request.query(addToMachine, (error, result) => {
        console.log('add machine error', error)
        if (error) res.send({code: 412, message: 'error'})
        else res.send({code: 415, data: result.recordset[0]})
    })
})

//-------------------- Machine End


//-------------------- Machine Service Start

router.post('/machine/:id/service/add', (req, res) => {
    const {
        serviceableComponent,
        replacementTime,
        volumeStandard,
        commodityUnit,
        commodityUnitID,
        isActive,
        description
    } = req.body;
    const {id} = req.params
    const request = new sql.Request();
    request.input("serviceableComponent", serviceableComponent);
    request.input("replacementTime", replacementTime);
    request.input("volumeStandard", volumeStandard);
    request.input("commodityUnit", commodityUnit);
    request.input("commodityUnitID", commodityUnitID);
    request.input("isActive", isActive);
    request.input("description", description);
    request.input("id", id);

    let addToMachineService = `INSERT INTO MachineService (ServiceableComponent, ReplacementTime, VolumeStandard, CommodityUnit, CommodityUnitID, IsActive, Description, MachineID, CreateBy)
                    output inserted.MachineServiceID, inserted.ServiceableComponent, inserted.ReplacementTime, inserted.VolumeStandard, inserted.CommodityUnit, inserted.CommodityUnitID, inserted.IsActive, inserted.Description, inserted.MachineID
                    Values (@serviceableComponent, @replacementTime, @volumeStandard, @commodityUnit, @commodityUnitID, @isActive, @description, @id, '')`

    request.query(addToMachineService, (error, result) => {
        console.log('addToMachineService error: ', error)
        // console.log('addToMachineCategoryPMItem result', result)
        if (error) res.send({code: 412, message: 'error'})
        else res.send({code: 415, data: result.recordset[0]})
    })
})

router.get('/machine/:id/service/view', async (req, res) => {
    await sql.connect(config, err => {
        if (err) console.log(err);
        const request = new sql.Request();
        const {id} = req.params
        const getMachineServices = `
            SELECT * FROM MachineService
            WHERE MachineID='${id}'
        `
        request.query(getMachineServices, (err, result) => {
            console.log('getMachineServices view error: ', err)
            // console.log('machine category view result: ', result)
            if (err) res.send({code: 412, message: 'errorrrrrrrrr'});
            else res.send({code: 415, data: result.recordset});
        });
    });
})

//-------------------- Machine Service End


//-------------------- Enum Start

router.get('/enum/:category', async (req, res) => {
    await sql.connect(config, err => {
        if (err) console.log(err);
        const request = new sql.Request();
        const {category} = req.params
        const getEnumValues = `
            select e.Title, e.EnumID, e.Code from Enum e join EnumCategory ec on e.EnumCategoryID=ec.EnumCategoryID where ec.Title=N'${category}'
        `
        request.query(getEnumValues, (err, result) => {
            console.log('getEnumValues view error: ', err)
            // console.log('machine category view result: ', result)
            if (err) res.send({code: 412, message: 'errorrrrrrrrr'});
            else res.send({code: 415, data: result.recordset});
        });
    });
});

//-------------------- Enum End


//-------------------- Event Start

router.post('/event/add', (req, res) => {
    const request = new sql.Request();
    request.input("TableName", req.body.TableName);
    request.input("EventType", req.body.EventType);
    request.input("ChangedField", req.body.ChangedField);
    request.input("OldValue", req.body.OldValue);
    request.input("NewValue", req.body.NewValue);

    let addToEvent = `INSERT INTO Event (TableName, EventType, ChangedField, OldValue, NewValue, CreateBy)
                    Values (@TableName, @EventType, @ChangedField, @OldValue, @NewValue, '')`

    request.query(addToEvent, (error, result) => {
        console.log('addToEvent error: ', error)
        // console.log('addToEvent result', result)
        if (error) res.send({code: 412, message: 'error'})
        else res.send({code: 415, data: result})
    })
})

//-------------------- Event End


//-------------------- Machine Request Start

router.get('/machine/request/view', async (req, res) => {
    await sql.connect(config, err => {
        if (err) console.log(err);
        const request = new sql.Request();
        const getMachineRequests = `
            SELECT * FROM MachineRequest
        `
        request.query(getMachineRequests, (err, result) => {
            console.log('getMachineRequests view error: ', err)
            // console.log('machine category view result: ', result)
            if (err) res.send({code: 412, message: 'errorrrrrrrrr'});
            else res.send({code: 415, data: result.recordset});
        });
    });
})

router.post('/machine/request/add', (req, res) => {
    const request = new sql.Request();
    request.input("RequestDate", req.body.RequestDate);
    request.input("ApplicantName", req.body.ApplicantName);
    request.input("ApplicantUnit", req.body.ApplicantUnit);
    request.input("MachineCategory", req.body.MachineCategory);
    request.input("MachineCategoryID", req.body.MachineCategoryID);
    request.input("RequestFromDate", req.body.RequestFromDate);
    request.input("RequestToDate", req.body.RequestToDate);
    request.input("RequestWorkTime", req.body.RequestWorkTime);
    request.input("WorkPlace", req.body.WorkPlace);
    request.input("WorkType", req.body.WorkType);
    request.input("WorkDescription", req.body.WorkDescription);

    let addToMachineRequest = `INSERT INTO MachineRequest (RequestDate, ApplicantName, ApplicantUnit, MachineCategory, MachineCategoryID, RequestFromDate, RequestToDate, RequestWorkTime, WorkPlace, WorkType, WorkDescription)
                                output inserted.MachineRequestID, inserted.RequestNumber
                    Values (@RequestDate, @ApplicantName, @ApplicantUnit, @MachineCategory, @MachineCategoryID, @RequestFromDate, @RequestToDate, @RequestWorkTime, @WorkPlace, @WorkType, @WorkDescription)`

    request.query(addToMachineRequest, (error, result) => {
        console.log('addToMachineRequest error: ', error)
        // console.log('addToMachineRequest result', result)
        if (error) res.send({code: 412, message: 'error'})
        else res.send({code: 415, data: result.recordset[0]})
    })
})


//-------------------- Machine Request End

//-------------------- Machine Request Replace Start

router.get('/machine/request/:id/replace/view', async (req, res) => {
    await sql.connect(config, err => {
        if (err) console.log(err);
        const request = new sql.Request();
        const {id} = req.params
        const getMachineRequestReplace = `
            SELECT * FROM MachineRequestReplace
            WHERE MachineRequestID='${id}'
        `
        request.query(getMachineRequestReplace, (err, result) => {
            console.log('getMachineRequestReplace view error: ', err)
            // console.log('machine category view result: ', result)
            if (err) res.send({code: 412, message: 'errorrrrrrrrr'});
            else res.send({code: 415, data: result.recordset});
        });
    });
})

router.post('/machine/request/replace/add', (req, res) => {
    const request = new sql.Request();
    request.input("MachineCategory", req.body.MachineCategory);
    request.input("MachineCategoryID", req.body.MachineCategoryID);
    request.input("MachineRequestID", req.body.MachineRequestID);

    let addToMachineRequestReplace = `INSERT INTO MachineRequestReplace (MachineCategory, MachineCategoryID, MachineRequestID)
                    Values (@MachineCategory, @MachineCategoryID, @MachineRequestID)`

    request.query(addToMachineRequestReplace, (error, result) => {
        console.log('addToMachineRequestReplace error: ', error)
        // console.log('addToMachineRequest result', result)
        if (error) res.send({code: 412, message: 'error'})
        else res.send({code: 415, data: result})
    })
})

//-------------------- Machine Request Replace End


module.exports = router;