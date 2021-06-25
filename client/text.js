import React, { Component } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import matchSorter from "match-sorter";
import * as Yup from "yup";
import "./goal.css";
import { Range, getTrackBackground } from "react-range";
import CKEditor from "ckeditor4-react";
import ReactTable from "react-table";
import deleteIcon from "../../assets/images/delete-icon.png";
import editIcon from "../../assets/images/edit-icon.png";
import { goalServies } from "../../services/goalServies";
import { assetAllocationService } from "../../services/assetAllocationService";
import {
  GoalStatus,
  GoalAchievementScale,
  GoalTypeNameIcon,
  AssetAllocationValueCount,
  CurrencyValue,
  CurrencyWordFormat,
  Loader,
} from "../commonComponents";
import $ from "jquery";
import { GoalCalculation } from "../commonComponents/goalCalculation/GoalCalculation";

import {
  error,
  success,
  warning,
  warningNotification,
  errorNotification,
  successNotification,
} from "../notification/notifications";
import * as costfile from "../../costfile.json";

class GoalPage extends Component {
  constructor(props) {
    var d = new Date();
    var goalStartYear = d.getFullYear();
    var goalStartMonth = d.getMonth();
    super(props);
    this.state = {
      education: false,
      marriage: false,
      vacation: false,
      retirement: false,
      house: false,
      car: false,
      wealth: false,
      contingencyFund: false,

      // Form values
      partyGoalId: null,
      goalTypeId: "",
      goalType: "",
      //goalTypeDisabledEnabled: false,

      familyMember: "",
      goalFamilyList: [],
      partyId: "",
      goalName: "",
      goalYear: goalStartYear.toString(), //goal Target year
      country: "",
      countryName: "",
      currentValue: 0,
      yearGap: 0,
      selectedGoalName: "",

      goalStartYear: goalStartYear,
      goalStartMonth: goalStartMonth,
      goalTargetMonth: goalStartMonth,

      goalPriority: 1,
      goalTypeOfType: "OK",

      // Eduction
      educationType: "",
      educationTypeCategory: "",
      collegeUniversity: "",

      educationCountry: "",
      educationCountryName: "",

      educationTypeName: "",
      educationTypeCategoryName: "",
      collegeUniversityName: "",

      // Marriage
      marriageCategory: "",
      marriageCategoryPlaceDestination: "",

      marriageCountry: "",
      marriageCountryName: "",

      marriageCategoryName: "",
      marriageCategoryPlaceDestinationName: "",

      // House
      houseCategory: "",
      houseCategoryPlaceLocation: "",

      houseCountry: "",
      houseCountryName: "",

      houseCategoryName: "",
      houseCategoryPlaceLocationName: "",

      // Vacation
      vacationType: "",
      vacationTypeName: "",

      vacationCountry: "",
      vacationCountryName: "",

      // Car
      carMaker: "",
      carModelClass: "",
      carMakerName: "",
      carModelClassName: "",

      // Calculation
      goalAchievementScaleValues: [0],
      inflationRateValues: 10,
      growthRateValues: 10,

      targetValue: 0,
      assetMappedValue: 0,
      deficitValue: 0,
      sipValue: 0,
      lumSumValue: 0,
      ckEditordata: "<p>No comments added!</p>",
      assetAllocation: [
        {
          // partyassetid: "",
          // assetcurrentvalue: "",
          // mappedpercentage: "",
          // assetallocatedvalue: "",
          // description: "",
          goalassetallocationid: "",
          partyassetid: "",
          assetcurrentvalue: "",
          assetallocatedvalue: "",
          assetremainingvalue: "",
          mappedpercentage: "",
          assetallocationpercentage: "",
        },
      ],

      //retirement goal
      NoOfYearsLeftForRetirement: "0",
      YearsAfterRetirement: "0",
      FirstMonthExpenseAfterRetirement: "0",
      RetirementCorpusRequired: "0",
      FundYouMust: "0",
      //Otherhide Calculation
      FirstYearExpenseAfterRetirementPost: "0",
      FirstYearExpenseAfterRetirementPre: "0",
      OtherHideCalculation: "0",

      //retirement goal range
      inflationRateValuesRetirement: 10,
      expectedPostRetirementReturn: 15,
      expectedPreRetirementReturn: 5,

      //retirement goal input and assumption
      currentAge: "",
      retirementAge: "",
      retirementYear: "",
      lifeExpectancy: "",
      currentHouseAndLifeStyleExpenses: "",
      netAdditionOrDeduction: "",

      //Other
      AssetAllocationAddNewRow: false,
      CurrentAssetvalues: 0,
      updateState: false,
      showForm: false,
      filtered: [], ////Filters for datatable
      filterAll: "", ////Filters for datatable
      retirementexpensesumvalue: "",
      showloader: false,
      disabled: false,
      
    };
    this.initialState = this.state;
    this.filterAll = this.filterAll.bind(this);
  }

  componentDidMount() {
   
    // console.log("propssssssss")
    // console.log(this.props.match.params)
    // goalServies.retirementexpensesum(this.props.match.params.id,
    //   (res) => {
    //     if (res.data.status === "success") {
    //       const data = res.data.responseListObject;
    //       console.log(data)
    //       this.setState({
    //         retirementexpensesumvalue: data.totalMonthlyExpense,
    //       });
    //     }
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // );
  }

  onFilteredChange(filtered) {
    // extra check for the "filterAll"
    if (filtered.length > 1 && this.state.filterAll.length) {
      // NOTE: this removes any FILTER ALL filter
      const filterAll = "";
      this.setState({
        filtered: filtered.filter((item) => item.id != "all"),
        filterAll,
      });
    } else this.setState({ filtered });
  }

  filterAll(e) {
    const { value } = e.target;
    const filterAll = value;
    const filtered = [{ id: "all", value: filterAll }];
    // NOTE: this completely clears any COLUMN filters
    this.setState({ filterAll, filtered });
  }
  // componentDidMount() {

  // }

  _LoadDataTable() {
    const { id } = this.props.match.params;
    const UserId = this.props.user.user.userId;
    const { fetchGoalData } = this.props;
    fetchGoalData(id, UserId);
  }

  _goalPageSchema = Yup.object().shape({
    goalType: Yup.string().required("Goal type is required"),
    familyMember: Yup.string().required("Family member is required"),
    goalName: Yup.string().required("Goal name is required"),
    goalYear: Yup.number()
      .min(2020, "Goal year should not be less than current year")
      .max(2100, "Goal year is 2100 at maximum")
      // .test("goalYear", "Goal year is current and future year", function (
      //   value
      // ) {
      //   var d = new Date();
      //   var goalStartYear = d.getFullYear();
      //   if (goalStartYear === Number(value)) {
      //     return true;
      //   } else if (goalStartYear < value) {
      //     return true;
      //   } else if (goalStartYear > value) {
      //     return false;
      //   } else {
      //     return true;
      //   }
      // })
      // .matches(/^.[0-9]+$/, {
      //   message: "Please enter digits only",
      //   excludeEmptyString: true,
      // })
      .required("Goal year is required"),

    currentValue: Yup.number()
      .required("Current Value is required")
      .min(0, "Current Value is 0 at minimum")
      .max(9999999999, "Current Value is 10 digit at maximum"),
    // .matches(/^.[0-9]+$/, {
    //   message: "Please enter digits only",
    //   excludeEmptyString: true,
    // }),

    // Education validation
    educationType: Yup.string().when("goalType", {
      is: "1",
      then: Yup.string().required("Education Type is required"),
    }),
    educationCountry: Yup.string().when("goalType", {
      is: "1",
      then: Yup.string().required("Location is required"),
    }),
    // educationTypeCategory: Yup.string().when("goalType", {
    //   is: "1",
    //   then: Yup.string().required("Category is required"),
    // }),
    collegeUniversity: Yup.string().when("goalType", {
      is: "1",
      then: Yup.string().required("College University is required"),
    }),

    // Marriage validation
    marriageCategory: Yup.string().when("goalType", {
      is: "2",
      then: Yup.string().required("Marriage Category is required"),
    }),
    marriageCountry: Yup.string().when("goalType", {
      is: "2",
      then: Yup.string().required("Country is required"),
    }),
    marriageCategoryPlaceDestination: Yup.string().when("goalType", {
      is: "2",
      then: Yup.string().required("Place/Destination is required"),
    }),

    // Retirement Validation
    currentAge: Yup.string().when("goalType", {
      is: "3",
      then: Yup.string().required("Current age is required"),
    }),
    retirementAge: Yup.string().when("goalType", {
      is: "3",
      then: Yup.string().required("Retirement age is required"),
    }),
    retirementYear: Yup.string().when("goalType", {
      is: "3",
      then: Yup.string().required("Retirement year is required"),
    }),
    lifeExpectancy: Yup.string().when("goalType", {
      is: "3",
      then: Yup.string().required("Life expectancy is required"),
    }),
    currentHouseAndLifeStyleExpenses: Yup.string().when("goalType", {
      is: "3",
      then: Yup.string().required(
        "Current house & life style expenses is required"
      ),
    }),
    // netAdditionOrDeduction: Yup.string().when("goalType", {
    //   is: "3",
    //   then: Yup.string().required(
    //     "Net addition or deduction is required"
    //   ),
    // }),

    // houseCategory validation
    houseCategory: Yup.string().when("goalType", {
      is: "4",
      then: Yup.string().required("Property is required"),
    }),
    houseCountry: Yup.string().when("goalType", {
      is: "4",
      then: Yup.string().required("Country is required"),
    }),
    houseCategoryPlaceLocation: Yup.string().when("goalType", {
      is: "4",
      then: Yup.string().required("Place/Location is required"),
    }),

    // Car validation
    carMaker: Yup.string().when("goalType", {
      is: "5",
      then: Yup.string().required("Car type is required"),
    }),
    carModelClass: Yup.string().when("goalType", {
      is: "5",
      then: Yup.string().required("Car model is required"),
    }),

    // Vacation validation
    vacationType: Yup.string().when("goalType", {
      is: "6",
      then: Yup.string().required("Vacation type is required"),
    }),
    vacationCountry: Yup.string().when("goalType", {
      is: "6",
      then: Yup.string().required("Country is required"),
    }),

    //  partyassetid
    // 	assetcurrentvalue
    // 	mappedpercentage
    // 	assetallocatedvalue
    assetAllocation: Yup.array().of(
      Yup.object().shape({
        //partyassetid: Yup.string().required("Asset name is required"),
        // assetcurrentvalue: Yup.string().required(
        //   "Asset current value is required"
        // ),
        mappedpercentage: Yup.number()
          .min(0, "Mapped % is 1 at minimum")
          .max(100, "Mapped % is 100 at maximum")
          .positive("Please enter positive number"),
        //.required("Mapped is required"),
        // assetallocatedvalue: Yup.string().required(
        //   "Asset allocated value is required"
        // ),
      })
    ),
  });

  //for add Goal data
  _handleSubmit = (values, { actions }) => {
    if (this.state.disabled === false) {
      this.setState({
        disabled: true,
      });

      if (Number(values.targetValue) < Number(values.assetMappedValue)) {
        warning(
          "Asset mapped values should not be greater than target value...!",
          warningNotification
        );
        return;
      }

      const { id } = this.props.match.params; // party Id
      const userId = this.props.user.user.userId;
      var variableData = [];
      var AssetAllcationData = [];
      if (values.assetAllocation.length === 1) {
        if (values.assetAllocation[0].partyassetid === "") {
          AssetAllcationData = [];
        } else {
          AssetAllcationData = values.assetAllocation;
          AssetAllcationData.map(
            (friend, index) => (
              (AssetAllcationData[index].partyassetid =
                friend.partyassetid || ""),
              (AssetAllcationData[index].partyId = id || ""),
              (AssetAllcationData[index].partygoalid =
                friend.partygoalid || ""),
              (AssetAllcationData[index].assetcurrentvalue =
                friend.assetcurrentvalue || ""),
              (AssetAllcationData[index].assetallocatedvalue =
                friend.assetallocatedvalue || ""),
              (AssetAllcationData[index].assetremainingvalue =
                friend.assetremainingvalue || ""),
              (AssetAllcationData[index].mappedpercentage =
                friend.mappedpercentage || ""),
              (AssetAllcationData[index].assetallocationpercentage =
                friend.mappedpercentage || ""),
                (AssetAllcationData[index].assetfuturevalue =
              friend.assetfuturevalue || ""),
              (AssetAllcationData[index].assetgrowthrate =
                    friend.assetgrowthrate || "")       
              //(AssetAllcationData[index].goalassetallocationid = friend.goalassetallocationid || "")
            )
          );
        }
      } else {
        AssetAllcationData = values.assetAllocation;
        AssetAllcationData.map(
          (friend, index) => (
            (AssetAllcationData[index].partyassetid =
              friend.partyassetid || ""),
            (AssetAllcationData[index].partyId = id || ""),
            (AssetAllcationData[index].partygoalid = friend.partygoalid || ""),
            (AssetAllcationData[index].assetcurrentvalue =
              friend.assetcurrentvalue || ""),
            (AssetAllcationData[index].assetallocatedvalue =
              friend.assetallocatedvalue || ""),
            (AssetAllcationData[index].assetremainingvalue =
              friend.assetremainingvalue || ""),
            (AssetAllcationData[index].mappedpercentage =
              friend.mappedpercentage || ""),
            (AssetAllcationData[index].assetallocationpercentage =
              friend.mappedpercentage || ""),
              (AssetAllcationData[index].assetfuturevalue =
            friend.assetfuturevalue || ""),
            (AssetAllcationData[index].assetgrowthrate =
             friend.assetgrowthrate || "")    
            //(AssetAllcationData[index].goalassetallocationid = friend.goalassetallocationid || "")
          )
        );
      }

      //#region Switch Data by goal

      switch (values.goalType.toString()) {
        case "1":
          //#region Education
          variableData = {
            educationType: values.educationType,
            country: values.educationCountry,
            stream: values.educationTypeCategory,
            collegeUniversity: values.collegeUniversity,
          };
          //#endregion Education
          break;
        case "2":
          //#region Marriage
          variableData = {
            marriageCategory: values.marriageCategory,
            country: values.marriageCountry,
            marriageCategoryPlaceDestination:
              values.marriageCategoryPlaceDestination,
          };
          //#endregion Marriage
          break;
        case "3":
          //#region Retirement
          variableData = {
            // retirement table
            NoOfYearsLeftForRetirement: values.NoOfYearsLeftForRetirement || 0,
            YearsAfterRetirement: values.YearsAfterRetirement || 0,
            FirstMonthExpenseAfterRetirement:
              values.FirstMonthExpenseAfterRetirement || 0,
            RetirementCorpusRequired: values.RetirementCorpusRequired || 0,
            FundYouMust: values.FundYouMust || 0,

            //Other Calculation
            FirstYearExpenseAfterRetirementPost:
              values.FirstYearExpenseAfterRetirementPost || 0,
            FirstYearExpenseAfterRetirementPre:
              values.FirstYearExpenseAfterRetirementPre || 0,
            OtherHideCalculation: values.OtherHideCalculation || 0,

            // Input & assumptions
            currentAge: values.currentAge || 0,
            retirementAge: values.retirementAge || 0,
            retirementYear: values.retirementYear || 0,
            lifeExpectancy: values.lifeExpectancy || 0,
            currentHouseAndLifeStyleExpenses:
              values.currentHouseAndLifeStyleExpenses || 0,
            netAdditionOrDeduction: values.netAdditionOrDeduction || 0,

            // RangenetAdditionOrDeduction
            inflationRateValuesRetirement:
              values.inflationRateValuesRetirement || 0,
            expectedPostRetirementReturn:
              values.expectedPostRetirementReturn || 0,
            expectedPreRetirementReturn:
              values.expectedPreRetirementReturn || 0,
          };
          //#endregion Retirement
          break;
        case "4":
          //#region property
          variableData = {
            country: values.houseCountry,
            houseCategory: values.houseCategory,
            houseCategoryPlaceLocation: values.houseCategoryPlaceLocation,
          };
          //#endregion property
          break;
        case "5":
          //#region Car
          variableData = {
            carMaker: values.carMaker,
            //country: values.country,
            carModelClass: values.carModelClass,
          };
          //#endregion Car
          break;
        case "6":
          //#region Vacation
          variableData = {
            country: values.vacationCountry,
            vacationType: values.vacationType,
          };
          //#endregion Vacation
          break;
        case "7":
          break;
        case "8":
          break;
        default:
          break;
      }

      //#endregion Switch Data by goal

      // var d = new Date();
      // var goalStartYear = d.getFullYear();
      // var goalStartMonth = d.getMonth();
debugger;
      const PassValues = {
        //goalTypeId:
        partyGoalId: values.partyGoalId,
        goalId: values.goalType,
        additionalInvestmentLumpsum:
          values.lumSumValue === 0 ? 1.0 : values.lumSumValue,
        additionalInvestmentSip:
          values.sipValue === "Infinity" ? 0 : values.sipValue,
        partyFamilyId: values.familyMember,
        partyId: id,
        goalName: values.goalName,
        goalStartYear: values.goalStartYear,
        goalStartMonth: values.goalStartMonth,
        goalTargetYear: values.goalYear,
        goalTargetMonth: values.goalStartMonth,
        goalPriority: 1,
        goalTypeOfType: "OK",
        targetValue: values.targetValue || 1,
        inflationRate:
          values.inflationRateValues.length > 0
            ? values.inflationRateValues
            : values.inflationRateValues,
        currentValue: values.currentValue || 0,
        goalAchievementScale: values.goalAchievementScaleValues[0] || 0,
        deficitValue: values.deficitValue || 0,
        growthRate:
          values.growthRateValues.length > 0
            ? values.growthRateValues
            : values.growthRateValues,
        assetmappedValue: values.assetMappedValue || 0,
        goalCommentary: values.ckEditordata || "No data found",
        partyGoalAssetAllocation: AssetAllcationData || [],
        partyGoalVariable: JSON.stringify(variableData),
        description : values.description || "",
      };
      if (!this.state.updateState) {
        this.props.addGoalData(
          PassValues,
          userId,
          (res) => {
            if (res["data"].status === "success") {
              success("Goal added successfully", successNotification);
              this.setState(this.initialState);

              this._LoadDataTable();
            } else if (res["data"].status === "fail") {
              error(
                "Somthing wents wrong..! " + res["data"].reasonText,
                errorNotification
              );
            } else {
              warning(
                "Somthing wents wrong..! " + res["data"].reasonText,
                warningNotification
              );
            }
          },
          (error) => {
            console.log(error);
          }
        );
      } else {
        this.props.updateGoalData(
          PassValues,
          userId,
          (res) => {
            if (res["data"].status === "success") {
              success("Goal updated successfully", successNotification);
              this.setState(this.initialState);

              this._LoadDataTable();
            } else if (res["data"].status === "fail") {
              error(
                "Somthing wents wrong..! " + res["data"].reasonText,
                errorNotification
              );
            } else {
              warning(
                "Somthing wents wrong..! " + res["data"].reasonText,
                warningNotification
              );
            }
          },
          (error) => {
            console.log(error);
          }
        );
      }
    }
  };

  //Show Hide Div on Edit
  _showHideDivOnEdit() {
    this.setState({
      education: false,
      marriage: false,
      vacation: false,
      retirement: false,
      house: false,
      car: false,
      wealth: false,
      contingencyFund: false,
    });
  }

  //#region BindGoal Data
  _bindGoalData(goalData) {
   
    this.setState(
      {
        // Form values
        partyGoalId: goalData.partyGoalId,
        // goalTypeId: goalData.goalTypeId,
        goalType: goalData.goalId.goalId,
        partyId: goalData.partyId,
        familyMember: goalData.partyFamilyId.partyfamilyid || [],
        goalName: goalData.goalName,
        goalYear: goalData.goalTargetYear,

        goalStartYear: goalData.goalStartYear, //No retrun
        goalStartMonth: goalData.goalStartMonth, //No retrun
        goalTargetMonth: goalData.goalStartMonth, //No retrun

        currentValue: goalData.currentValue,
        //goalAchievementScaleValues: [goalData.goalAchievementScale] || [0], //No return
        inflationRateValues: goalData.inflationRate || 0, //No return
        growthRateValues: 12, //No return
        targetValue: goalData.targetValue,
        //assetMappedValue: goalData.assetmappedValue, // No return
        //deficitValue: goalData.deficitValue,
        sipValue: goalData.additionalInvestmentSip, // No return
        lumSumValue: goalData.additionalInvestmentLumpsum, // No return

        ckEditordata: goalData.goalCommentary, //No return
        description: goalData.description
      },
      console.log(JSON.stringify(this.state))
    );

   
    const UserId = this.props.user.user.userId;
    const { id } = this.props.match.params;

    const familyMember = goalData.partyFamilyId.partyfamilyid;
    goalServies.getGoalFamilyMember(
      UserId,
      id,
      goalData.goalId.goalId,
      (res) => {
        if (res.data.status === "success") {
          const data = res.data.responseListObject;
          this.setState({
            goalFamilyList: data,
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );

    //#region Switch Data by goal

    const partyGoalVariable = JSON.parse(goalData.partyGoalVariable || "");

    switch (goalData.goalId.goalId.toString()) {
      case "1":
        //#region Education
        this._showHideDivOnEdit();
        this.setState({
          educationType: partyGoalVariable.educationType,
          educationCountry: partyGoalVariable.country,
          educationTypeCategory: partyGoalVariable.stream,
          collegeUniversity: partyGoalVariable.collegeUniversity,
          education: true,
        });
        //#endregion Education
        break;
      case "2":
        //#region Marriage
        this._showHideDivOnEdit();
        this.setState({
          marriageCategory: partyGoalVariable.marriageCategory,
          marriageCountry: partyGoalVariable.country,
          marriageCategoryPlaceDestination:
            partyGoalVariable.marriageCategoryPlaceDestination,
          marriage: true,
        });
        //#endregion Marriage
        break;
      case "3":
        //#region Retirement
        this._showHideDivOnEdit();
        this.setState({
          // country: partyGoalVariable.country,
          // retirement table
          NoOfYearsLeftForRetirement:
            partyGoalVariable.NoOfYearsLeftForRetirement || 0,
          YearsAfterRetirement: partyGoalVariable.YearsAfterRetirement || 0,
          FirstMonthExpenseAfterRetirement:
            partyGoalVariable.FirstMonthExpenseAfterRetirement || 0,
          RetirementCorpusRequired:
            partyGoalVariable.RetirementCorpusRequired || 0,
          FundYouMust: partyGoalVariable.FundYouMust || 0,

          //Other Calculation
          FirstYearExpenseAfterRetirementPost:
            partyGoalVariable.FirstYearExpenseAfterRetirementPost || 0,
          FirstYearExpenseAfterRetirementPre:
            partyGoalVariable.FirstYearExpenseAfterRetirementPre || 0,
          OtherHideCalculation: partyGoalVariable.OtherHideCalculation || 0,

          // Input & assumptions
          currentAge: partyGoalVariable.currentAge || 0,
          retirementAge: partyGoalVariable.retirementAge || 0,
          retirementYear: partyGoalVariable.retirementYear || 0,
          lifeExpectancy: partyGoalVariable.lifeExpectancy || 0,
          currentHouseAndLifeStyleExpenses:
            partyGoalVariable.currentHouseAndLifeStyleExpenses || 0,
          netAdditionOrDeduction: partyGoalVariable.netAdditionOrDeduction || 0,

          // RangenetAdditionOrDeduction
          inflationRateValuesRetirement:
            partyGoalVariable.inflationRateValuesRetirement || 0,
          expectedPostRetirementReturn:
            partyGoalVariable.expectedPostRetirementReturn || 0,
          expectedPreRetirementReturn:
            partyGoalVariable.expectedPreRetirementReturn || 0,

          retirement: true,
        });

        //#endregion Retirement
        break;
      case "4":
        //#region property
        this._showHideDivOnEdit();
        this.setState({
          houseCountry: partyGoalVariable.country,
          houseCategory: partyGoalVariable.houseCategory,
          houseCategoryPlaceLocation:
            partyGoalVariable.houseCategoryPlaceLocation,
          house: true,
        });
        //#endregion property
        break;
      case "5":
        //#region Car
        this._showHideDivOnEdit();
        this.setState({
          carMaker: partyGoalVariable.carMaker,
          // country: partyGoalVariable.country,
          carModelClass: partyGoalVariable.carModelClass,
          car: true,
        });
        //#endregion Car
        break;
      case "6":
        //#region Vacation
        this._showHideDivOnEdit();
        this.setState({
          vacationCountry: partyGoalVariable.country,
          vacationType: partyGoalVariable.vacationType,
          vacation: true,
        });
        //#endregion Vacation
        break;
      case "7":
        this._showHideDivOnEdit();
        break;
      case "8":
        this._showHideDivOnEdit();
        break;
      default:
        this._showHideDivOnEdit();
        break;
    }

    //#endregion Switch Data by goal

    //#region AssetAllocation calculation
   
    // else {
    var partyGoalAssetAllocationData = Object.values(
      goalData.partyGoalAssetAllocation
    ).filter((x) => x.partygoalid === goalData.partyGoalId);

    // Asset Allocated values for other than retiremetn goal
    var assetallocatedvalueDetails = 0;
    {
      (partyGoalAssetAllocationData || []).map(
        (assetAllocationDetail) =>
          (assetallocatedvalueDetails +=
            assetAllocationDetail.assetfuturevalue)
      );
    }
    // Asset allocated value for retirement goal
    var retirementassetallocatedvalueDetails = 0;
    {
      (partyGoalAssetAllocationData || []).map(
        (assetAllocationDetail) =>
          (retirementassetallocatedvalueDetails +=
            assetAllocationDetail.assetfuturevalue)
      );
    }
    if (
      Object.values(goalData.partyGoalAssetAllocation).filter(
        (x) => x.partygoalid === goalData.partyGoalId
      ).length === 0
    ) {
      this.setState({
        assetAllocation: [],
        AssetAllocationAddNewRow: true,
      });
    } else {
      this.setState({
        assetAllocation: goalData.partyGoalAssetAllocation,
        AssetAllocationAddNewRow: false,
      });
    }

    if (goalData.goalId.goalId.toString() !== "3") {
      //All Goal expect Retirement
      var yearGapDetails =
        Number(goalData.goalTargetYear) - Number(goalData.goalStartYear);
      //if (yearGapDetails > 0) {
        var AssetMappedValueData = GoalCalculation.AssetMappedValue(
          assetallocatedvalueDetails,
          0 ,
          1
        ).toFixed(0);

        var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
          AssetMappedValueData,
          goalData.targetValue
        );

        var difitiatValuesDetails =
          Number(goalData.targetValue) - Number(AssetMappedValueData);

        var lumSumValueData = GoalCalculation.lumSumValueData(
          difitiatValuesDetails,
          goalData.growthRate || 0,
          yearGapDetails
        );

        var SIPValueData = GoalCalculation.SIPValueData(
          difitiatValuesDetails,
          goalData.growthRate || 0,
          yearGapDetails
        );

        this.setState({
          assetMappedValue: AssetMappedValueData,
          goalAchievementScaleValues: [
            Number((GoalAchievementScaleData || 0).toFixed(0)),
          ],
          deficitValue: (difitiatValuesDetails || 0).toFixed(0),
          lumSumValue: lumSumValueData.toFixed(0),
          sipValue: SIPValueData === "Infinity" ? 0 : SIPValueData.toFixed(0),
        });
      //}
    } else {
      // Goal  Retirement
      var AssetMappedValueData = GoalCalculation.AssetMappedValue(
        retirementassetallocatedvalueDetails,
        0,
        1
      );
     
      var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
        AssetMappedValueData,
        partyGoalVariable.RetirementCorpusRequired
      );

      var deficitValueData =
        (Number(partyGoalVariable.RetirementCorpusRequired) +Number(partyGoalVariable.FundYouMust) )-
        Number(AssetMappedValueData);

      lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
        partyGoalVariable.expectedPreRetirementReturn || 0,
        partyGoalVariable.NoOfYearsLeftForRetirement || 0,
        deficitValueData
      );

      SIPValueData = GoalCalculation.SIPValueDataRetirement(
        partyGoalVariable.expectedPreRetirementReturn || 0,
        partyGoalVariable.NoOfYearsLeftForRetirement || 0,
        deficitValueData
      );

      this.setState({
        assetMappedValue: Number(AssetMappedValueData.toFixed(0)),
        goalAchievementScaleValues: [
          Number((GoalAchievementScaleData || 0).toFixed(0)),
        ],
        deficitValue: deficitValueData.toFixed(0),
        lumSumValue: lumSumValueData.toFixed(0),
        sipValue: SIPValueData === "Infinity" ? 0 : SIPValueData.toFixed(0),
      });
      //}

      this.setState({
        assetAllocation: partyGoalAssetAllocationData,
        yearGap: yearGapDetails,
      });
    }
    //#endregion AssetAllocation calculation

    this.setState({
      updateState: true,
      showForm: true,
    });
    window.scrollTo(0, 0);
  }
  //#endregion BindGoal Data

  // hide form on cancel button
  _hideForm = (e) => {
    this._LoadDataTable();
    this.setState(this.initialState);
    this.setState({ assetAllocation: this.initialState.assetAllocation });
  };

  // SHOW loader
  _showloaderonForm = (e) => {
    this.setState({ showloader: true });
  };
  // HIDE loader
  _hideloaderonForm = (e) => {
    this.setState({ showloader: false });
  };

  Redirect = () => {
    const { id } = this.props.match.params;
    this.props.history.push("/liability/" + id);
  };
  RedirectBack = () => {
    const { id } = this.props.match.params;
    this.props.history.push("/assetMgmt/" + id);
  };

  render() {
    //#region  Data table column

    const columns = [
      {
        Header: "Goal Name",
        accessor: "goalName",
        Cell: (row) => (
          <div>
            <span>
              <GoalTypeNameIcon state={this.props.goalData[row.index] || []} />
            </span>
          </div>
        ),
      },
      {
        Header: () => (
          <div
            style={{
              textAlign: "left",
            }}
          >
            Priority
          </div>
        ),
        accessor: "goalPriority",
        Cell: (row) => (
          <div style={{ textAlign: "center" }}>{row.value || 1}</div>
        ),
      },
      {
        Header: () => (
          <div
            style={{
              textAlign: "left",
            }}
          >
            Year To Goal
          </div>
        ),
        accessor: "goalTargetYear",
        Cell: (row) => (
          <div style={{ textAlign: "left" }}>{row.value || ""}</div>
        ),
      },
      {
        Header: () => (
          <div
            style={{
              textAlign: "left",
            }}
          >
            Present Value (INR)
          </div>
        ),
        accessor: "currentValue",
        Cell: (row) => (
          <div
            style={{ textAlign: "right" }}
            title={(row.value || 0)
              .toString()
              .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
          >
            <CurrencyValue state={row.value || 0}></CurrencyValue>
            {/* <div className="tooltip-ex-text tooltip-ex-top">{(row.value || 0)
              .toString()
              .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}</div> */}
            {/* {(row.value || 0)
              .toFixed(2)
              .replace(/(\d)(?=(\d{2})+\d\.)/g, "$1,")} */}
          </div>
        ),
      },
      {
        Header: () => (
          <div
            style={{
              textAlign: "left",
            }}
          >
            Target Value (INR)
          </div>
        ),
        accessor: "targetValue",
        Cell: (row) => (
          <div
            style={{ textAlign: "right" }}
            title={(row.value || 0)
              .toString()
              .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
          >
            <CurrencyValue state={row.value || 0}></CurrencyValue>
            {/* {(row.value || 0)
              .toFixed(2)
              .replace(/(\d)(?=(\d{2})+\d\.)/g, "$1,")} */}
          </div>
        ),
      },

      // {
      //   Header: () => (
      //     <div
      //       style={{
      //         textAlign: "right",
      //       }}
      //     >
      //       Asset Allocated Value (INR)
      //     </div>
      //   ),
      //   //accessor: "partyGoalAssetAllocation[0].assetallocatedvalue",
      //   accessor: "partyGoalAssetAllocation[0].assetallocatedvalue",
      //   Cell: (row) => (
      //     <div style={{ textAlign: "right" }}>
      //       {(row.value || 0)
      //         .toFixed(2)
      //         .replace(/(\d)(?=(\d{2})+\d\.)/g, "$1,")}
      //     </div>
      //   ),
      //   // sortMethod: (a, b) => {
      //   //   return a[0].assetallocatedvalue ;

      //   // },
      // },
      {
        Header: () => (
          <div
            style={{
              textAlign: "left",
            }}
          >
            Asset Allocated Value (INR)
          </div>
        ),
        accessor: "assetmappedValue",
        Cell: (row) => (
          <div>
            <div
              style={{ textAlign: "right" }}
              title={(row.value || 0)
                .toString()
                .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
            >
              <span>
                <AssetAllocationValueCount
                  state={this.props.goalData[row.index] || []}
                />
              </span>
            </div>
          </div>
        ),
      },
      {
        Header: "Goal Achievement Scale",
        accessor: "goalAchievementScale",
        Cell: (row) => (
          <div>
            <span>
              <GoalAchievementScale
                state={this.props.goalData[row.index] || []}
              />
            </span>
          </div>
        ),
      },
      {
        Header: "Goal Status",
        accessor: "goalStatus",
        Cell: (row) => (
          <div>
            <span>
              <GoalStatus state={this.props.goalData[row.index] || []} />
            </span>
          </div>
        ),
      },
      {
        Header: () => (
          <div
            style={{
              textAlign: "left",
            }}
          >
            Action
          </div>
        ),

        id: "delete",
        accessor: (str) => "delete",

        Cell: (row) => (
          <div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "inline",
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  const partyGoalData = this.props.goalData[row.index];
                  this._bindGoalData(partyGoalData);
                }}
              >
                <img src={editIcon} />
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span
                style={{ display: "inline", cursor: "pointer" }}
                onClick={() => {
                  const userId = this.props.user.user.userId;
                  const partyGoalId = this.props.goalData[row.index]
                    .partyGoalId;
                  goalServies.deleteGoal(partyGoalId, userId, (res) => {
                    if (res.data.status === "success") {
                      success("Goal deleted successfully", successNotification);
                      this._LoadDataTable();
                      window.location.reload();
                    } else {
                      warning(
                        "Somthing wents wrong..! " + res["data"].reasonText,
                        warningNotification
                      );
                    }
                  });
                }}
              >
                <img src={deleteIcon} />
              </span>
            </div>
          </div>
        ),
      },
      {
        Header: "All",
        id: "all",
        width: 0,
        resizable: false,
        sortable: false,
        show: false,
        Filter: () => {},
        getProps: () => {
          return {
            // style: { padding: "0px"}
          };
        },
        filterMethod: (filter, rows) => {
          const result = matchSorter(rows, filter.value, {
            keys: [
              "goalName",
              "goalPriority",
              "goalTargetYear",
              "currentValue",
              "targetValue",
              //"partyGoalAssetAllocation.assetallocatedvalue",
              "goalAchievementScale",
              "goalStatus",
            ],
          });

          return result;
        },
        filterAll: true,
      },
    ];
    //#endregion  Data table column

    return (
      
      <div>
        {" "}
        {this.state.showForm ? (
          <div>
            <div className="all-title">Add Goal</div>
            <Formik

              enableReinitialize
              initialValues={{
                //#region  InitialValues
                // Form values
                partyGoalId: this.state.partyGoalId,
                goalTypeId: this.state.goalTypeId,
                goalType: this.state.goalType,
                // goalTypeDisabledEnabled: this.state.goalTypeDisabledEnabled,

                //From values
                familyMember: this.state.familyMember,
                goalFamilyList: this.state.goalFamilyList || [],
                goalName: this.state.goalName,
                goalYear: this.state.goalYear,
                country: this.state.country,
                countryName: this.state.countryName,
                currentValue: this.state.currentValue,
                selectedGoalName: this.state.selectedGoalName,

                goalStartYear: this.state.goalStartYear,
                goalStartMonth: this.state.goalStartMonth,
                goalTargetMonth: this.state.goalStartMonth,
                yearGap: this.state.yearGap,

                goalPriority: this.state.goalPriority,
                goalTypeOfType: this.state.goalTypeOfType,

                // Eduction
                educationType: this.state.educationType,
                educationTypeCategory: this.state.educationTypeCategory,
                collegeUniversity: this.state.collegeUniversity,
                // educationTypeData: [],
                educationCountry: this.state.educationCountry,
                educationCountryName: this.state.educationCountryName,

                educationTypeName: this.state.educationTypeName,
                educationTypeCategoryName: this.state.educationTypeCategoryName,

                // Marriage
                marriageCategory: this.state.marriageCategory,
                marriageCategoryPlaceDestination: this.state
                  .marriageCategoryPlaceDestination,
                // marriageCategory: [],
                marriageCountry: this.state.marriageCountry,
                marriageCountryName: this.state.marriageCountryName,

                marriageCategoryName: this.state.marriageCategoryName,
                marriageCategoryPlaceDestinationName: this.state
                  .marriageCategoryPlaceDestinationName,

                // House
                houseCategory: this.state.houseCategory,
                houseCategoryPlaceLocation: this.state
                  .houseCategoryPlaceLocation,
                //houseCategory: [],
                houseCountry: this.state.houseCountry,
                houseCountryName: this.state.houseCountryName,

                houseCategoryName: this.state.houseCategoryName,
                houseCategoryPlaceLocationName: this.state
                  .houseCategoryPlaceLocationName,

                // Vacation
                vacationType: this.state.vacationType,
                vacationTypeName: this.state.vacationTypeName,
                vacationCountry: this.state.vacationCountry,
                vacationCountryName: this.state.vacationCountryName,
                // vacationType: [],

                // Car
                carMaker: this.state.carMaker,
                carModelClass: this.state.carModelClass,
                //carMaker: [],

                carMakerName: this.state.carMakerName,
                carModelClassName: this.state.carModelClassName,

                //Show Hide code
                education: this.state.education,
                marriage: this.state.marriage,
                vacation: this.state.vacation,
                retirement: this.state.retirement,
                house: this.state.house,
                car: this.state.car,
                wealth: this.state.wealth,
                contingencyFund: this.state.contingencyFund,

                //Range Bar
                goalAchievementScaleValues: this.state
                  .goalAchievementScaleValues,
                inflationRateValues: this.state.inflationRateValues,
                growthRateValues: this.state.growthRateValues,

                targetValue: this.state.targetValue, // same retirement
                assetMappedValue: this.state.assetMappedValue, // same retirement
                deficitValue: this.state.deficitValue, // same retirement
                sipValue: this.state.sipValue, // same retirement
                lumSumValue: this.state.lumSumValue, // same retirement

                //AssetAllocation
                assetAllocation: this.state.assetAllocation,

                ckEditordata: this.state.ckEditordata,

                //retirement goal
                /*table*/
                NoOfYearsLeftForRetirement: this.state
                  .NoOfYearsLeftForRetirement,
                YearsAfterRetirement: this.state.YearsAfterRetirement,
                FirstMonthExpenseAfterRetirement: this.state
                  .FirstMonthExpenseAfterRetirement,
                RetirementCorpusRequired: this.state.RetirementCorpusRequired,
                FundYouMust: this.state.FundYouMust,

                //Other Hide calculation
                FirstYearExpenseAfterRetirementPost: this.state
                  .FirstYearExpenseAfterRetirementPost,
                FirstYearExpenseAfterRetirementPre: this.state
                  .FirstYearExpenseAfterRetirementPre,
                OtherHideCalculation: this.state.OtherHideCalculation,
                /*table other*/

                //Input and Assumption
                currentAge: this.state.currentAge,
                retirementAge: this.state.retirementAge,
                retirementYear: this.state.retirementYear,
                lifeExpectancy: this.state.lifeExpectancy,
                currentHouseAndLifeStyleExpenses: this.state
                  .currentHouseAndLifeStyleExpenses,
                netAdditionOrDeduction: this.state.netAdditionOrDeduction,

                inflationRateValuesRetirement: this.state
                  .inflationRateValuesRetirement,
                expectedPostRetirementReturn: this.state
                  .expectedPostRetirementReturn,
                expectedPreRetirementReturn: this.state
                  .expectedPreRetirementReturn,

                //other values
                AssetAllocationAddNewRow: this.state.AssetAllocationAddNewRow,
                CurrentAssetvalues: this.state.CurrentAssetvalues,
                updateState: this.state.updateState,
                showloader: this.state.showloader,
                description: this.state.description
                //#endregion  InitialValues
              }}
              validationSchema={this._goalPageSchema}
              onSubmit={this._handleSubmit}
            >
              {({ touched, errors, setFieldValue, values, handleChange }) => (
                <Form>
                  <div className="goal-gray-box">
                    <div className="col-sm-12 col-md-12 goal-type-box">
                      <div className="col-sm-12 col-md-6 pl">
                        <div className="form-group ">
                          <label
                            htmlFor=""
                            className="col-sm-2 control-label labelbold required "
                          >
                            Goal Type
                          </label>

                          <div className="col-sm-10 col-width-0">
                            <Field
                              as="select"
                              name="goalType"
                              autoFocus
                              className={
                                "form-control mod-input" +
                                (errors.goalType && touched.goalType
                                  ? " is-invalid"
                                  : "")
                              }
                              disabled={values.updateState}
                              onChange={(event) => {
                                var index =
                                  event.nativeEvent.target.selectedIndex;
                                const goalType = event.target.value;
                                const selectedGoalName =
                                  event.nativeEvent.target[index].text;

                                this.setState({
                                  goalType: goalType,
                                  selectedGoalName: selectedGoalName,
                                });

                                const UserId = this.props.user.user.userId;
                                const { id } = this.props.match.params;

                                goalServies.getGoalFamilyMember(
                                  UserId,
                                  id,
                                  goalType,
                                  (res) => {
                                    if (res.data.status === "success") {
                                      const data = res.data.responseListObject;
                                      this.setState({
                                        goalFamilyList: data,
                                      });
                                    }
                                  },
                                  (error) => {
                                    console.log(error);
                                  }
                                );

                                //#region reset all
                                this.setState({
                                  partyGoalId: null,
                                  familyMember: "",
                                  partyId: "",
                                  goalName: "",
                                  goalYear: this.state.goalStartYear, //goal Target year
                                  //(values.country = ""),
                                  countryName: "",
                                  currentValue: 0,
                                  // Eduction
                                  educationType: "",
                                  educationCountry: "",
                                  educationTypeCategory: "",
                                  collegeUniversity: "",
                                  // (values.educationTypeName = ""),
                                  // (values.educationTypeCategoryName = ""),
                                  collegeUniversityName: "",
                                  // Marriage
                                  marriageCategory: "",
                                  marriageCountry: "",
                                  marriageCategoryPlaceDestination: "",
                                  // (values.marriageCategoryName = ""),
                                  // (values.marriageCategoryPlaceDestinationName =
                                  // ""),
                                  // House
                                  houseCategory: "",
                                  houseCategoryPlaceLocation: "",
                                  houseCountry: "",
                                  // (values.houseCategoryName = ""),
                                  // (values.houseCategoryPlaceLocationName = ""),
                                  // Vacation
                                  vacationType: "",
                                  //(values.vacationTypeName = ""),
                                  vacationCountry: "",
                                  // Car
                                  carMaker: "",
                                  carModelClass: "",
                                  // (values.carMakerName = ""),
                                  // (values.carModelClassName = ""),
                                  //Main box
                                  targetValue: 0,
                                  assetMappedValue: 0,
                                  deficitValue: 0,
                                  sipValue: 0,
                                  lumSumValue: 0,
                                  //(values.assetAllocation = []),
                                  assetAllocation: [
                                    {
                                      goalassetallocationid: "",
                                      partyassetid: "",
                                      assetcurrentvalue: "",
                                      assetallocatedvalue: "",
                                      assetremainingvalue: "",
                                      mappedpercentage: "",
                                      assetallocationpercentage: "",
                                    },
                                  ],
                                  //retirement goal
                                  NoOfYearsLeftForRetirement: "0",
                                  YearsAfterRetirement: "0",
                                  FirstMonthExpenseAfterRetirement: "0",
                                  RetirementCorpusRequired: "0",
                                  FundYouMust: "0",
                                  //retirement goal input and assumption
                                  currentAge: "",
                                  retirementAge: "", //assumption
                                  retirementYear: "",
                                  lifeExpectancy: "", //asssumption
                                  currentHouseAndLifeStyleExpenses: "",
                                  netAdditionOrDeduction: "",
                                });

                                var currentValueDetails = 0;
                                //#endregion

                                //#region  Code values show hide call
                                if (goalType.toString() === "1") {
                                  // Education
                                  this.setState({
                                    education: true,
                                    marriage: false,
                                    vacation: false,
                                    retirement: false,
                                    house: false,
                                    car: false,
                                    wealth: false,
                                    contingencyFund: false,
                                  });
                                } else if (goalType.toString() === "2") {
                                  // marriage
                                  this.setState({
                                    marriage: true,
                                    education: false,
                                    vacation: false,
                                    retirement: false,
                                    house: false,
                                    car: false,
                                    wealth: false,
                                    contingencyFund: false,
                                  });
                                } else if (goalType.toString() === "3") {
                                  //Retirement
                                  var expenseData = 0;
                                  if (
                                    this.props.expensesDataRetirement !== null
                                  ) {
                                    expenseData =
                                      this.props.expensesDataRetirement
                                        .totalMonthlyExpense || [];
                                  }

                                 
                                  // const expenseDataValues = Object.values(
                                  //   expenseData
                                  // ).filter(
                                  //   (x) =>
                                  //     x.expenseTypeId.codeValueId === 10801 ||
                                  //     x.expenseTypeId.codeValueId === 10803
                                  //   );
                                  // var expenseDataDetails = 0;
                                  // {
                                  //   (expenseDataValues || []).map(
                                  //     (expenseDataValues) =>
                                  //       (expenseDataDetails +=
                                  //         expenseDataValues.monthlyExpense)
                                  //   );
                                  // }
                                  this.setState({
                                    retirement: true,
                                    education: false,
                                    marriage: false,
                                    vacation: false,
                                    house: false,
                                    car: false,
                                    wealth: false,
                                    contingencyFund: false,
                                    currentHouseAndLifeStyleExpenses: expenseData, // expenseDataDetails,
                                    currentValue: 0,
                                  });
                                } else if (goalType.toString() === "4") {
                                  // house
                                  this.setState({
                                    house: true,
                                    education: false,
                                    marriage: false,
                                    vacation: false,
                                    retirement: false,
                                    car: false,
                                    wealth: false,
                                    contingencyFund: false,
                                  });
                                } else if (goalType.toString() === "5") {
                                  //car
                                  this.setState({
                                    car: true,
                                    education: false,
                                    marriage: false,
                                    vacation: false,
                                    retirement: false,
                                    house: false,
                                    wealth: false,
                                    contingencyFund: false,
                                  });
                                } else if (goalType.toString() === "6") {
                                  // vacation
                                  this.setState({
                                    vacation: true,
                                    education: false,
                                    marriage: false,
                                    retirement: false,
                                    house: false,
                                    car: false,
                                    wealth: false,
                                    contingencyFund: false,
                                  });
                                } else if (goalType.toString() === "7") {
                                  //wealth
                                  this.setState({
                                    vacation: false,
                                    education: false,
                                    marriage: false,
                                    retirement: false,
                                    house: false,
                                    car: false,
                                    wealth: true,
                                    contingencyFund: false,
                                    currentValue: 5000000,
                                  });
                                  currentValueDetails = 5000000;
                                } else if (goalType.toString() === "8") {
                                  //contingencyFund
                                  this.setState({
                                    contingencyFund: true,
                                    education: false,
                                    marriage: false,
                                    vacation: false,
                                    retirement: false,
                                    house: false,
                                    car: false,
                                    wealth: false,
                                    currentValue: 1000000,
                                  });
                                  currentValueDetails = 1000000;
                                } else {
                                  //other
                                  this.setState({
                                    education: false,
                                    marriage: false,
                                    vacation: false,
                                    retirement: false,
                                    house: false,
                                    car: false,
                                    wealth: false,
                                    contingencyFund: false,
                                  });
                                }
                                //#endregion  Code values show hide call

                                //#region  Assumption data bind
                                var assumptionndata =
                                  this.props.assumptionsData || [];

                                if (assumptionndata.length > 0) {
                                  const inflationRate = Object.values(
                                    assumptionndata
                                  ).filter(
                                    (x) => x.assumptionname === "Inflation Rate"
                                  )[0].assumptionvalue;
                                  this.setState({
                                    inflationRateValues: inflationRate || 10,
                                    inflationRateValuesRetirement:
                                      inflationRate || 10,
                                  });
                                  const growthRate = Object.values(
                                    assumptionndata
                                  ).filter(
                                    (x) => x.assumptionname === "Growth Rate"
                                  )[0].assumptionvalue;
                                  this.setState({
                                    growthRateValues: growthRate || 10,
                                  });
                                  const RetirementStartAge = Object.values(
                                    assumptionndata
                                  ).filter(
                                    (x) =>
                                      x.assumptionname ===
                                      "Retirement Start Age"
                                  )[0].assumptionvalue;

                                  this.setState({
                                    retirementAge: RetirementStartAge || 60,
                                  });

                                  const LifeExpectancyAge = Object.values(
                                    assumptionndata
                                  ).filter(
                                    (x) =>
                                      x.assumptionname === "Life Expectancy Age"
                                  )[0].assumptionvalue;

                                  this.setState({
                                    lifeExpectancy: LifeExpectancyAge || 80,
                                  });

                                  const ExpectedPostRetirementReturn = Object.values(
                                    assumptionndata
                                  ).filter(
                                    (x) =>
                                      x.assumptionname ===
                                      "Expected Post Retirement Return"
                                  )[0].assumptionvalue;

                                  this.setState({
                                    expectedPostRetirementReturn:
                                      ExpectedPostRetirementReturn || 10,
                                  });

                                  const ExpectedPreRetirementReturn = Object.values(
                                    assumptionndata
                                  ).filter(
                                    (x) =>
                                      x.assumptionname ===
                                      "Expected Pre Retirement Return"
                                  )[0].assumptionvalue;

                                  this.setState({
                                    expectedPreRetirementReturn:
                                      ExpectedPreRetirementReturn || 10,
                                  });
                                }

                                //#endregion  Assumption data bind

                                //#region calculation

                                if (
                                  goalType.toString() === "7" ||
                                  goalType.toString() === "8"
                                ) {
                                  var yearGap =
                                    Number(this.state.goalYear) -
                                    Number(this.state.goalStartYear);
                                  this.setState({ yearGap: yearGap });

                                  var targetValueData = GoalCalculation.TargetValue(
                                    currentValueDetails,
                                    this.state.inflationRateValues,
                                    this.state.yearGap
                                  );

                                  var assetallocatedvalueDetails = 0;
                                  {
                                    (values.assetAllocation || []).map(
                                      (assetAllocationDetail) =>
                                        (assetallocatedvalueDetails +=
                                          assetAllocationDetail.assetallocatedvalue)
                                    );
                                  }

                                  var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                    assetallocatedvalueDetails,
                                    this.state.inflationRateValues,
                                    this.state.yearGap
                                  );

                                  if (
                                    Number(targetValueData) <
                                    Number(AssetMappedValueData)
                                  ) {
                                    warning(
                                      "Asset mapped values should not be greater than target value...!",
                                      warningNotification
                                    );
                                    return;
                                  }

                                  var deficitValueData =
                                    targetValueData -
                                    Number(AssetMappedValueData);

                                  var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                    AssetMappedValueData,
                                    targetValueData
                                  );

                                  var lumSumValueData = GoalCalculation.lumSumValueData(
                                    deficitValueData,
                                    this.state.growthRateValues,
                                    this.state.yearGap
                                  );

                                  var SIPValueData = GoalCalculation.SIPValueData(
                                    deficitValueData,
                                    this.state.growthRateValues,
                                    this.state.yearGap
                                  );

                                  this.setState({
                                    currentValue: currentValueDetails,
                                    targetValue: targetValueData.toFixed(0),
                                    assetMappedValue: AssetMappedValueData.toFixed(
                                      0
                                    ),
                                    deficitValue: deficitValueData.toFixed(0),
                                    goalAchievementScaleValues: [
                                      GoalAchievementScaleData.toFixed(0),
                                    ],
                                    lumSumValue: lumSumValueData.toFixed(0),
                                    sipValue:
                                      SIPValueData === "Infinity"
                                        ? 0
                                        : SIPValueData.toFixed(0),
                                  });
                                }
                                //#endregion
                              }}
                            >
                              <option value="">Select Goal Type</option>
                              {(this.props.goalType || []).map((goalType) => (
                                <option
                                  key={goalType.goalId}
                                  value={JSON.stringify(goalType.goalId)}
                                >
                                  {goalType.description}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              component="div"
                              name="goalType"
                              className="text-danger"
                            />
                          </div>
                        </div>
                        <div className="clearfix"></div>
                      </div>

                      <div className="col-sm-12 col-md-6 pull-right pullLeft">
                        <div className="prog-box col-sm-12 col-md-6 prog-box pull-right ">
                          <div className="prog-label">
                            Goal Achievement Scale
                          </div>{" "}
                          <div className="prog-count">
                            {" "}
                            {values.goalAchievementScaleValues}%
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <Range
                              values={values.goalAchievementScaleValues}
                              step="1"
                              min="0"
                              max="100"
                              name="goalAchievementScaleValues"
                              onChange={(event) =>
                                setFieldValue(
                                  (values.goalAchievementScaleValues = [
                                    event[0],
                                  ])
                                )
                              }
                              renderTrack={({ props, goalAchievement }) => (
                                <div
                                  style={{
                                    ...props.style,
                                    height: "36px",
                                    display: "flex",
                                    width: "100%",
                                  }}
                                >
                                  <div
                                    ref={props.ref}
                                    style={{
                                      height: "15px",
                                      width: "100%",
                                      borderRadius: "10px",
                                      background: getTrackBackground({
                                        values:
                                          values.goalAchievementScaleValues,
                                        colors: ["#3ac68b", "#ccc"],
                                        min: "1",
                                        max: "100",
                                      }),
                                      alignSelf: "center",
                                    }}
                                  >
                                    {goalAchievement}
                                  </div>
                                </div>
                              )}
                              renderThumb={({ props, isDragged }) => (
                                <div></div>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="clearfix"></div>
                    </div>
                    <div className="col-sm-12 col-md-8">
                      <div className="family-details">
                        <div className="col-sm-12 col-md-4 pl pr">
                          <div className="form-group">
                            <label htmlFor="" className="required">
                              Family Member
                            </label>
                            <Field
                              as="select"
                              name="familyMember"
                              className={
                                "form-control mod-input" +
                                (errors.familyMember && touched.familyMember
                                  ? " is-invalid"
                                  : "")
                              }
                              disabled={values.updateState}
                              onChange={(event) => {
                                const familyMemberValue = event.target.value;
                                const index =
                                  event.nativeEvent.target.selectedIndex;
                                const goalNameValues =
                                  event.nativeEvent.target[
                                    index
                                  ].text.toString() +
                                  " " +
                                  values.selectedGoalName.toString();

                                setFieldValue(
                                  (values.familyMember = familyMemberValue),
                                  (values.goalName = goalNameValues)
                                );
                                if (values.marriage) {
                                  const UserId = this.props.user.user.userId;
                                  const { id } = this.props.match.params;
                                  var passData = {
                                    partyid: id,
                                    partyfamilyid: familyMemberValue,
                                  };
                                 
                                  goalServies.getGoalYear(
                                    passData,
                                    UserId,
                                    (res) => {
                                      if (res.data.status === "success") {
                                        const goalYear =
                                          res.data.responseObject;
                                        setFieldValue(
                                          (values.goalYear = goalYear)
                                        );
                                      } else {
                                        setFieldValue(
                                          (values.goalYear =
                                            values.goalStartYear)
                                        );
                                      }
                                    }
                                  );
                                }

                                if (!values.retirement) {
                                  return;
                                }

                                //Existing Goal retirement
                                var mainGoalList = Object(
                                  this.props.goalData
                                ).filter(
                                  (x) =>
                                    x.partyFamilyId.partyfamilyid ===
                                      Number(familyMemberValue) &&
                                    x.goalId.goalId === 3
                                );
                                if (mainGoalList.length === 1) {
                                  warning(
                                    "The family member goal is aleady exist...!",
                                    warningNotification
                                  );
                                  setFieldValue(
                                    (values.currentAge = 0),
                                    (values.retirementYear = 0),
                                    (values.NoOfYearsLeftForRetirement = 0),
                                    (values.YearsAfterRetirement = 0),
                                    (values.FirstMonthExpenseAfterRetirement = 0),
                                    (values.RetirementCorpusRequired = 0),
                                    (values.FundYouMust = 0),
                                    (values.targetValue = 0),
                                    (values.deficitValue = 0),
                                    (values.lumSumValue = 0),
                                    (values.sipValue = 0),
                                    (values.familyMember = ""),
                                    (values.goalName = "")
                                  );
                                  return;
                                }

                                var familyMemberdata = this.props.familyMember;
                                var familyMemberAge = Object.values(
                                  familyMemberdata
                                ).filter(
                                  (x) =>
                                    x.partyfamilyid ===
                                    Number(familyMemberValue)
                                );

                                //#region retirementCalculation

                                var NoOfYearsLeftForRetirementValues =
                                  values.retirementAge - familyMemberAge[0].age;
                                var YearsAfterRetirementValues =
                                  values.lifeExpectancy - values.retirementAge;

                                var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                  values.currentHouseAndLifeStyleExpenses,
                                  values.inflationRateValuesRetirement,
                                  NoOfYearsLeftForRetirementValues
                                );

                                var FirstYearExpenseAfterRetirementPostDetails =
                                  Number(
                                    FirstMonthExpenseAfterRetirementDetails
                                  ) * 12;

                                var FirstYearExpenseAfterRetirementPre =
                                  FirstYearExpenseAfterRetirementPostDetails /
                                  (1 - 0.2);

                                var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                  values.expectedPostRetirementReturn,
                                  values.inflationRateValuesRetirement
                                );

                                var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                  RateOtherhideCalculation,
                                  YearsAfterRetirementValues,
                                  FirstYearExpenseAfterRetirementPre
                                );

                                var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                  values.expectedPreRetirementReturn,
                                  YearsAfterRetirementValues,
                                  RetirementCorpusRequiredDetails
                                );

                                var TotalCorpusRequiredDetails =
                                  RetirementCorpusRequiredDetails +
                                  FundYouMustDetails;

                                var deficitValueData =
                                  RetirementCorpusRequiredDetails +
                                  FundYouMustDetails;

                                var lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                  values.expectedPreRetirementReturn,
                                  NoOfYearsLeftForRetirementValues,
                                  deficitValueData
                                );

                                var SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                  values.expectedPreRetirementReturn,
                                  NoOfYearsLeftForRetirementValues,
                                  deficitValueData
                                );

                                //#endregion

                                setFieldValue(
                                  (values.currentAge = familyMemberAge[0].age),
                                  (values.retirementYear =
                                    values.goalStartYear +
                                    NoOfYearsLeftForRetirementValues),
                                  (values.goalYear =
                                    values.goalStartYear +
                                    NoOfYearsLeftForRetirementValues),
                                  (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                  (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                  (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                    0
                                  )),
                                  (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                    0
                                  )),
                                  (values.FundYouMust = FundYouMustDetails.toFixed(
                                    0
                                  )),
                                  (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                    0
                                  )),
                                  (values.deficitValue = deficitValueData.toFixed(
                                    0
                                  )),
                                  (values.lumSumValue = lumSumValueData.toFixed(
                                    0
                                  )),
                                  (values.sipValue = SIPValueData.toFixed(0))
                                );
                              }}
                            >
                              <option>Select Family Member</option>
                              {(values.goalFamilyList || []).map(
                                (familyDetail) => (
                                  <option
                                    key={familyDetail.partyfamilyid}
                                    value={JSON.stringify(
                                      familyDetail.partyfamilyid
                                    )}
                                  >
                                    {familyDetail.fullname}
                                  </option>
                                )
                              )}
                              {/* {this.props.familyMember.map((familyDetail) => (
                                <option
                                  key={familyDetail.partyfamilyid}
                                  value={JSON.stringify(
                                    familyDetail.partyfamilyid
                                  )}
                                >
                                  {familyDetail.fullname}
                                </option>
                              ))} */}
                            </Field>
                            <ErrorMessage
                              component="div"
                              name="familyMember"
                              className="text-danger"
                            />
                          </div>
                        </div>
                        <div className="col-sm-12 col-md-4 pl pr">
                          <div className="form-group">
                            <label htmlFor="" className="required">
                              Goal Name
                            </label>
                            <Field
                              type="text"
                              name="goalName"
                              maxLength="80"
                              className={
                                "form-control mod-input" +
                                (errors.goalName && touched.goalName
                                  ? " is-invalid"
                                  : "")
                              }
                              id="goalName"
                              placeholder="Goal Name"
                            />
                            <ErrorMessage
                              component="div"
                              name="goalName"
                              className="text-danger"
                            />
                          </div>
                        </div>
                        {!values.retirement ? (
                          <div className="col-sm-12 col-md-2 pl pr">
                            <div className="form-group">
                              <label htmlFor="" className="required">
                                Goal Year
                              </label>

                              <Field
                                as="select"
                                //defaultValue="Select Year"
                                name="goalYear"
                                autoFocus
                                id="goalYear"
                                //maxLength="4"
                                min={values.goalStartYear}
                                max={values.goalStartYear + 100}
                                className={
                                  "form-control mod-input" +
                                  (errors.goalYear && touched.goalYear
                                    ? " is-invalid"
                                    : "")
                                }
                                id="goalYear"
                                placeholder="Goal Year"
                                onChange={(event) => {
                                 

                                  $("#goalYear").prop("disabled", "disabled");
                                  var goalYear = Number(event.target.value);
                                  console.log("valuesssssssss");
                                  console.log(values);
                                  // alert(goalYear)
                                  var yearGap =
                                    Number(goalYear) -
                                    Number(values.goalStartYear);

                                  if (values.currentValue.toString() === "") {
                                    setFieldValue(
                                      (values.goalYear = goalYear),
                                      (values.yearGap = Number(yearGap))
                                    );
                                    console.log("returning.....");
                                    return;
                                  }

                                  setFieldValue(
                                    (values.goalYear = goalYear),
                                    (values.yearGap = Number(yearGap))
                                  );

                                  let d = new Date();
                                  var thisyear = d.getFullYear();

                                  if (
                                    Number(goalYear) <=
                                    Number(values.goalStartYear)
                                  ) {
                                    if (!values.retirement) {
                                      var assetallocatedvalueDetails = 0;
                                      {
                                        (values.assetAllocation || []).map(
                                          (assetAllocationDetail) =>
                                            (assetallocatedvalueDetails +=
                                              assetAllocationDetail.assetallocatedvalue)
                                        );
                                      }
                                      let deficit = Number(
                                        values.currentValue -
                                          assetallocatedvalueDetails
                                      ).toFixed(0);

                                      var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                        assetallocatedvalueDetails,
                                        values.currentValue
                                      );
                                      GoalAchievementScaleData = Number(
                                        GoalAchievementScaleData
                                      ).toFixed(0);
                                      setFieldValue(
                                        (values.targetValue =
                                          values.currentValue),
                                        (values.deficitValue = deficit),
                                        (values.goalAchievementScaleValues = [
                                          GoalAchievementScaleData,
                                        ]),
                                        (values.lumSumValue = deficit),
                                        (values.sipValue = 0),
                                        (values.assetMappedValue = assetallocatedvalueDetails)
                                      );
                                      $("#goalYear").prop("disabled", "");
                                      console.log("returning 2.....");
                                      return;
                                    } else {
                                      // var assetallocatedvalueDetails = 0;
                                      // {
                                      //   (values.assetAllocation || []).map(
                                      //     (assetAllocationDetail) =>
                                      //       (assetallocatedvalueDetails +=
                                      //         assetAllocationDetail.assetallocatedvalue)
                                      //   );
                                      // }
                                      // let deficit = Number(values.currentValue - assetallocatedvalueDetails).toFixed(0);

                                      // var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                      //   assetallocatedvalueDetails,
                                      //   values.currentValue
                                      // );
                                      // GoalAchievementScaleData = Number(GoalAchievementScaleData).toFixed(0)
                                      // setFieldValue(
                                      //   (values.targetValue = values.currentValue),
                                      //   (values.deficitValue = deficit),
                                      //   (values.goalAchievementScaleValues = [GoalAchievementScaleData]),
                                      //   (values.lumSumValue = deficit ),
                                      //   (values.sipValue = 0),
                                      //   (values.assetMappedValue = assetallocatedvalueDetails),

                                      // );
                                      // $("#goalYear").prop('disabled', '');
                                      // console.log("returning 2.....")
                                      return;
                                    }
                                  }

                                  // if (
                                  //   Number(thisyear) ==
                                  //   Number(values.goalStartYear)
                                  // ) {
                                  //   setFieldValue(
                                  //     (values.targetValue = values.CurrencyValue),
                                  //     (values.deficitValue = 0),
                                  //     (values.goalAchievementScaleValues = [0]),
                                  //     (values.lumSumValue = values.CurrencyValue),
                                  //     (values.sipValue = 0)
                                  //   );
                                  //   $("#goalYear").prop('disabled', '');
                                  //   console.log("returning 2.....")
                                  //   return;
                                  // }

                                  if (goalYear > 2020) {
                                    var targetValueData = GoalCalculation.TargetValue(
                                      values.currentValue,
                                      values.inflationRateValues,
                                      values.yearGap
                                    );

                                    var assetallocatedvalueDetails = 0;
                                    {
                                      (values.assetAllocation || []).map(
                                        (assetAllocationDetail) =>
                                          (assetallocatedvalueDetails +=
                                            assetAllocationDetail.assetfuturevalue)
                                      );
                                    }

                                  
                                    // var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                    //   assetallocatedvalueDetails,
                                    //   values.inflationRateValues,
                                    //   values.yearGap
                                    // );
                                    var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                      assetallocatedvalueDetails,
                                      0,
                                      1
                                    );
                                    if (
                                      Number(targetValueData) <
                                      Number(AssetMappedValueData)
                                    ) {
                                      warning(
                                        "Asset mapped values should not be greater than target value...!",
                                        warningNotification
                                      );
                                      console.log("returning 3.....");
                                      return;
                                    }

                                    var deficitValueData =
                                      targetValueData -
                                      Number(AssetMappedValueData);

                                    var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                      AssetMappedValueData,
                                      targetValueData
                                    );

                                    var lumSumValueData = GoalCalculation.lumSumValueData(
                                      deficitValueData,
                                      values.growthRateValues,
                                      values.yearGap
                                    );

                                    var SIPValueData = GoalCalculation.SIPValueData(
                                      deficitValueData,
                                      values.growthRateValues,
                                      values.yearGap
                                    );

                                    // setFieldValue(
                                    //   (values.targetValue = "0"),
                                    //   (values.deficitValue = "0"),
                                    //    (values.goalAchievementScaleValues = [0]),
                                    //     (values.lumSumValue = "0"),
                                    //     (values.sipValue = "0")
                                    //   );

                                    window.focus();
                                    // setTimeout(() => {
                                    setFieldValue(
                                      //(values.currentValue = values.currentValue),
                                      // (values.goalYear = Number(goalYear)),
                                      // (values.yearGap = Number(yearGap)),
                                      (values.targetValue = targetValueData.toFixed(
                                        0
                                      )),
                                      (values.assetMappedValue = AssetMappedValueData.toFixed(
                                        0
                                      )),
                                      (values.deficitValue = deficitValueData.toFixed(
                                        0
                                      )),
                                      (values.goalAchievementScaleValues = [
                                        GoalAchievementScaleData.toFixed(0),
                                      ]),
                                      (values.lumSumValue = lumSumValueData.toFixed(
                                        0
                                      )),
                                      (values.sipValue =
                                        SIPValueData === "Infinity"
                                          ? 0
                                          : SIPValueData.toFixed(0))
                                    );

                                    $("#goalYear").prop("disabled", "");

                                    // },
                                    //   200
                                    // )
                                  }
                                }}
                              >
                                <option value="2020">2020</option>
                                <option value="2021">2021</option>
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                                <option value="2028">2028</option>
                                <option value="2029">2029</option>
                                <option value="2030">2030</option>
                                <option value="2031">2031</option>
                                <option value="2032">2032</option>
                                <option value="2033">2033</option>
                                <option value="2034">2034</option>
                                <option value="2035">2035</option>
                                <option value="2036">2036</option>
                                <option value="2037">2037</option>
                                <option value="2038">2038</option>
                                <option value="2039">2039</option>
                                <option value="2040">2040</option>
                                <option value="2041">2041</option>
                                <option value="2042">2042</option>
                                <option value="2043">2043</option>
                                <option value="2044">2044</option>
                                <option value="2045">2045</option>
                                <option value="2046">2046</option>
                                <option value="2047">2047</option>
                                <option value="2048">2048</option>
                                <option value="2049">2049</option>
                                <option value="2050">2050</option>
                                <option value="2051">2051</option>
                                <option value="2052">2052</option>
                                <option value="2053">2053</option>
                                <option value="2054">2054</option>
                                <option value="2055">2055</option>
                                <option value="2056">2056</option>
                                <option value="2057">2057</option>
                                <option value="2058">2058</option>
                                <option value="2059">2059</option>
                                <option value="2060">2060</option>
                                <option value="2061">2061</option>
                                <option value="2062">2062</option>
                                <option value="2063">2063</option>
                                <option value="2064">2064</option>
                                <option value="2065">2065</option>
                                <option value="2066">2066</option>
                                <option value="2067">2067</option>
                                <option value="2068">2068</option>
                                <option value="2069">2069</option>
                                <option value="2070">2070</option>
                                <option value="2071">2071</option>
                                <option value="2072">2072</option>
                                <option value="2073">2073</option>
                                <option value="2074">2074</option>
                                <option value="2075">2075</option>
                                <option value="2076">2076</option>
                                <option value="2077">2077</option>
                                <option value="2078">2078</option>
                                <option value="2079">2079</option>
                                <option value="2080">2080</option>
                                <option value="2081">2081</option>
                                <option value="2082">2082</option>
                                <option value="2083">2083</option>
                                <option value="2084">2084</option>
                                <option value="2085">2085</option>
                                <option value="2086">2086</option>
                                <option value="2087">2087</option>
                                <option value="2088">2088</option>
                                <option value="2089">2089</option>
                                <option value="2090">2090</option>
                                <option value="2091">2091</option>
                                <option value="2092">2092</option>
                                <option value="2093">2093</option>
                                <option value="2094">2094</option>
                                <option value="2095">2095</option>
                                <option value="2096">2096</option>
                                <option value="2097">2097</option>
                                <option value="2098">2098</option>
                                <option value="2099">2099</option>
                                <option value="2100">2100</option>
                                <option value="2101">2101</option>
                                <option value="2102">2102</option>
                                <option value="2103">2103</option>
                                <option value="2104">2104</option>
                                <option value="2105">2105</option>
                                <option value="2106">2106</option>
                                <option value="2107">2107</option>
                                <option value="2108">2108</option>
                                <option value="2109">2109</option>
                                <option value="2110">2110</option>
                                <option value="2111">2111</option>
                                <option value="2112">2112</option>
                                <option value="2113">2113</option>
                                <option value="2114">2114</option>
                                <option value="2115">2115</option>
                                <option value="2116">2116</option>
                                <option value="2117">2117</option>
                                <option value="2118">2118</option>
                                <option value="2119">2119</option>
                                <option value="2120">2120</option>
                              </Field>
                              <ErrorMessage
                                component="div"
                                name="goalYear"
                                className="text-danger"
                              />
                            </div>
                          </div>
                        ) : null}
                        <div className="clearfix"></div>
                      </div>
                    </div>

                    <div className="col-sm-12 col-md-12">
                      <div className="education-details">
                        {values.education ? (
                          <div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Education Type
                                </label>
                                <Field
                                  as="select"
                                  name="educationType"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;
                                    //#region  rest code

                                    setFieldValue(
                                      (values.educationType =
                                        event.target.value),
                                      (values.educationTypeName =
                                        event.nativeEvent.target[index].text),
                                      (values.educationCountry = ""),
                                      (values.educationCountryName = ""),
                                      (values.educationTypeCategory = ""),
                                      (values.educationTypeCategoryName = "")
                                      //current values
                                    );
                                    //#endregion rest code
                                   alert(values.goalName) ; 
                                  // setFieldValue(
                                  //   (values.goalName = goalNameValues)
                                  // );

                                    const UserId = this.props.user.user.userId;
                                    const { id } = this.props.match.params;
                                    var passData = {
                                      partyid: id,
                                      partyfamilyid: values.familyMember,
                                      educationAgeCalculation: {
                                        stream: values.educationTypeName,
                                        age: this.props.familyMember.age, //Question?
                                      },
                                    };

                                    goalServies.getGoalYear(
                                      passData,
                                      UserId,
                                      (res) => {
                                        if (res.data.status === "success") {
                                          var goalYear =
                                            res.data.responseObject;
                                          setFieldValue(
                                            (values.goalYear = goalYear)
                                          );
                                        } else {
                                          setFieldValue(
                                            (values.goalYear =
                                              values.goalStartYear)
                                          );
                                        }
                                      }
                                    );
                                  }}
                                >
                                  <option value="">
                                    Select Education Type
                                  </option>
                                  {(this.props.educationType || []).map(
                                    (educationType) => (
                                      <option
                                        key={educationType.codeValueId}
                                        value={JSON.stringify(
                                          educationType.codeValueId
                                        )}
                                      >
                                        {educationType.codeValue}
                                      </option>
                                    )
                                  )}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="educationType"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Location
                                </label>
                                <Field
                                  as="select"
                                  name="educationCountry"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;
                                    setFieldValue(
                                      (values.educationCountry =
                                        event.target.value),
                                      (values.educationCountryName =
                                        event.target.value),
                                      //#region  rest code
                                      (values.educationTypeCategory = ""),
                                      (values.educationTypeCategoryName = "")

                                      //current values
                                      //#endregion rest code
                                    );
                                  }}
                                >
                                  <option value="">Select Location</option>
                                  {
                                  //   (this.props.country || []).map((team) => (
                                  //   <option
                                  //     key={team.countryId}
                                  //     value={team.countryId}
                                  //   >
                                  //     {team.countryName}
                                  //   </option>
                                  // ))
                                  (this.props.Location || []).map((team) => (
                                    <option
                                      
                                      value={team.codeValue === "Domestic" ? "India" : "Other international"}
                                    >
                                      {team.codeValue}
                                    </option>
                                  ))
                                  }
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="educationCountry"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr hideeducationcategory">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Category
                                </label>
                                <Field
                                  as="select"
                                  name="educationTypeCategory"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;
                                    const educationTypeCategoryData =
                                      event.nativeEvent.target[index].text;
                                    const educationTypeCategory =
                                      event.target.value;

                                    setFieldValue(
                                      (values.educationTypeCategory = educationTypeCategory)
                                    );

                                    var educationTypeData = {
                                      education: {
                                        stream: values.educationTypeName,
                                        country: values.educationCountryName,
                                        category_College_University: educationTypeCategoryData,
                                      },
                                    };

                                    const userId = this.props.user.user.userId;
                                    goalServies.getCurrency(
                                      educationTypeData,
                                      userId,
                                      (res) => {
                                        if (res.data.status === "success") {
                                        } else {
                                        }
                                        setFieldValue(
                                          (values.currentValue =
                                            res.data.responseObject === null
                                              ? 300000
                                              : res.data.responseObject
                                                  .Cost_in_INR)
                                        );

                                        var yearGap =
                                          Number(values.goalYear) -
                                          Number(values.goalStartYear);
                                        setFieldValue(
                                          (values.yearGap = yearGap)
                                        );

                                        var targetValueData = GoalCalculation.TargetValue(
                                          values.currentValue,
                                          values.inflationRateValues,
                                          values.yearGap
                                        );

                                        var assetallocatedvalueDetails = 0;
                                        {
                                          (values.assetAllocation || []).map(
                                            (assetAllocationDetail) =>
                                              (assetallocatedvalueDetails +=
                                                assetAllocationDetail.assetfuturevalue)
                                          );
                                        }

                                        var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                          assetallocatedvalueDetails,
                                          0,
                                          1
                                        );

                                        if (
                                          Number(targetValueData) <
                                          Number(AssetMappedValueData)
                                        ) {
                                          warning(
                                            "Asset mapped values should not be greater than target value...!",
                                            warningNotification
                                          );
                                          return;
                                        }

                                        var deficitValueData =
                                          targetValueData -
                                          Number(AssetMappedValueData);

                                        var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                          AssetMappedValueData,
                                          targetValueData
                                        );

                                        var lumSumValueData = GoalCalculation.lumSumValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        var SIPValueData = GoalCalculation.SIPValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        setFieldValue(
                                          (values.currentValue =
                                            values.currentValue),
                                          (values.targetValue = targetValueData.toFixed(
                                            0
                                          )),
                                          (values.assetMappedValue = AssetMappedValueData.toFixed(
                                            0
                                          )),
                                          (values.deficitValue = deficitValueData.toFixed(
                                            0
                                          )),
                                          (values.goalAchievementScaleValues = [
                                            GoalAchievementScaleData.toFixed(0),
                                          ]),
                                          (values.lumSumValue = lumSumValueData.toFixed(
                                            0
                                          )),
                                          (values.sipValue =
                                            SIPValueData === "Infinity"
                                              ? 0
                                              : SIPValueData.toFixed(0))
                                        );
                                      }
                                    );

                                    // #endregion  call service for amount
                                  }}
                                >
                                  <option value="">Select Category</option>
                                  {(this.props.educationTypeCategory || []).map(
                                    (educationTypeCategory) => (
                                      <option
                                        key={educationTypeCategory.codeValueId}
                                        value={JSON.stringify(
                                          educationTypeCategory.codeValueId
                                        )}
                                      >
                                        {educationTypeCategory.codeValue}
                                      </option>
                                    )
                                  )}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="educationTypeCategory"
                                  className="text-danger"
                                />
                              </div>
                            </div>

                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  College/University
                                </label>
                                <Field
                                  type="text"
                                  name="collegeUniversity"
                                  className="form-control"
                                  placeholder="College/University"
                                  id="collegeUniversity"
                                ></Field>
                                <ErrorMessage
                                  component="div"
                                  name="collegeUniversity"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {values.marriage ? (
                          <div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Marriage Category
                                </label>
                                <Field
                                  as="select"
                                  name="marriageCategory"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;

                                    setFieldValue(
                                      (values.marriageCategory =
                                        event.target.value),
                                      (values.marriageCategoryName =
                                        event.nativeEvent.target[index].text),
                                      (values.marriageCategoryPlaceDestination =
                                        ""),
                                      (values.marriageCountry = ""),
                                      (values.marriageCountryName = "")
                                    );
                                  }}
                                >
                                  <option value="">Select Marriage Type</option>
                                  {(this.props.marriageCategory || []).map(
                                    (marriageCategory) => (
                                      <option
                                        key={marriageCategory.codeValueId}
                                        value={JSON.stringify(
                                          marriageCategory.codeValueId
                                        )}
                                      >
                                        {marriageCategory.codeValue}
                                      </option>
                                    )
                                  )}{" "}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="marriageCategory"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Location
                                </label>
                                <Field
                                  as="select"
                                  name="marriageCountry"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;
                                    //#region  rest code
                                    setFieldValue(
                                      (values.marriageCountry =
                                        event.target.value),
                                      (values.marriageCountryName =
                                        event.target.value),
                                      (values.marriageCategoryPlaceDestination =
                                        "")

                                      //#endregion rest code
                                    );
                                  }}
                                >
                                  <option value="">Select Location</option>
                                  {
                                    //   (this.props.country || []).map((team) => (
                                  //   <option
                                  //     key={team.countryId}
                                  //     value={team.countryId}
                                  //   >
                                  //     {team.countryName}
                                  //   </option>
                                  // ))
                                  (this.props.Location || []).map((team) => (
                                    <option
                                      
                                      value={team.codeValue === "Domestic" ? "India" : "International"}
                                    >
                                      {team.codeValue}
                                    </option>
                                  ))
                                  }
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="marriageCountry"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Place/Destination
                                </label>
                                <Field
                                  as="select"
                                  name="marriageCategoryPlaceDestination"
                                  className="form-control"
                                  onChange={(event) => {
                                   
                                    var index =
                                      event.nativeEvent.target.selectedIndex;

                                    const marriageCategoryPlaceDestinationdata =
                                      event.target.value;
                                    const marriageCategoryPlaceDestinationdatatext =
                                      event.nativeEvent.target[index].text;

                                    setFieldValue(
                                      (values.marriageCategoryPlaceDestination = marriageCategoryPlaceDestinationdata)
                                    );
                                    // #region  call service for amount

                                    var marriageCategoryData = {
                                      marriage: {
                                        marriageCategory:
                                          values.marriageCategoryName,
                                        country: values.marriageCountryName,
                                        place_Destination: marriageCategoryPlaceDestinationdatatext,
                                      },
                                    };
                                    const userId = this.props.user.user.userId;

                                    goalServies.getCurrency(
                                      marriageCategoryData,
                                      userId,
                                      (res) => {
                                        if (res.data.status === "success") {
                                        } else {
                                        }

                                        var amount =
                                          res.data.responseObject === null
                                            ? 100000
                                            : Number(
                                                res.data.responseObject
                                                  .Cost_in_INR
                                              );

                                        setFieldValue(
                                          (values.currentValue = amount)
                                        );

                                        var yearGap =
                                          Number(values.goalYear) -
                                          Number(values.goalStartYear);
                                        setFieldValue(
                                          (values.yearGap = yearGap)
                                        );

                                        var targetValueData = GoalCalculation.TargetValue(
                                          values.currentValue,
                                          values.inflationRateValues,
                                          values.yearGap
                                        );

                                        var assetallocatedvalueDetails = 0;
                                        {
                                          (values.assetAllocation || []).map(
                                            (assetAllocationDetail) =>
                                              (assetallocatedvalueDetails +=
                                                assetAllocationDetail.assetfuturevalue)
                                          );
                                        }

                                        var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                          assetallocatedvalueDetails,
                                          0,
                                          1
                                        );

                                        if (
                                          Number(targetValueData) <
                                          Number(AssetMappedValueData)
                                        ) {
                                          warning(
                                            "Asset mapped values should not be greater than target value...!",
                                            warningNotification
                                          );
                                          return;
                                        }

                                        var deficitValueData =
                                          targetValueData -
                                          Number(AssetMappedValueData);

                                        var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                          AssetMappedValueData,
                                          targetValueData
                                        );

                                        var lumSumValueData = GoalCalculation.lumSumValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        var SIPValueData = GoalCalculation.SIPValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        setFieldValue(
                                          (values.currentValue =
                                            values.currentValue),
                                          (values.targetValue = targetValueData.toFixed(
                                            0
                                          )),
                                          (values.assetMappedValue = AssetMappedValueData.toFixed(
                                            0
                                          )),
                                          (values.deficitValue = deficitValueData.toFixed(
                                            0
                                          )),
                                          (values.goalAchievementScaleValues = [
                                            GoalAchievementScaleData.toFixed(0),
                                          ]),
                                          (values.lumSumValue = lumSumValueData.toFixed(
                                            0
                                          )),
                                          (values.sipValue =
                                            SIPValueData === "Infinity"
                                              ? 0
                                              : SIPValueData.toFixed(0))
                                        );
                                      }
                                    );

                                    // #endregion  call service for amount
                                  }}
                                >
                                  <option value="">
                                    Select Place/Destination
                                  </option>
                                  {(
                                    this.props
                                      .marriageCategoryPlaceDestination || []
                                  ).map((marriageCategoryPlaceDestination) => (
                                    <option
                                      key={
                                        marriageCategoryPlaceDestination.codeValueId
                                      }
                                      value={JSON.stringify(
                                        marriageCategoryPlaceDestination.codeValueId
                                      )}
                                    >
                                      {
                                        marriageCategoryPlaceDestination.codeValue
                                      }
                                    </option>
                                  ))}{" "}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="marriageCategoryPlaceDestination"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {values.house ? (
                          <div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Property
                                </label>
                                <Field
                                  as="select"
                                  name="houseCategory"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;

                                    setFieldValue(
                                      (values.houseCategory =
                                        event.target.value),
                                      (values.houseCategoryName =
                                        event.nativeEvent.target[index].text),
                                      (values.houseCategoryPlaceLocation = ""),
                                      (values.houseCategoryPlaceLocationName =
                                        ""),
                                      (values.houseCountry = ""),
                                      (values.houseCountryName = "")
                                    );
                                  }}
                                >
                                  <option value="">Select Property Type</option>
                                  {(this.props.houseCategory || []).map(
                                    (houseCategory) => (
                                      <option
                                        key={houseCategory.codeValueId}
                                        value={JSON.stringify(
                                          houseCategory.codeValueId
                                        )}
                                      >
                                        {houseCategory.codeValue}
                                      </option>
                                    )
                                  )}{" "}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="houseCategory"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Location
                                </label>
                                <Field
                                  as="select"
                                  name="houseCountry"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;
                                    setFieldValue(
                                      (values.houseCountry =
                                        event.target.value),
                                      (values.houseCountryName =
                                        event.target.value),
                                      (values.houseCategoryPlaceLocation = ""),
                                      (values.houseCategoryPlaceLocationName =
                                        "")
                                      //#region  rest code
                                      //#endregion rest code
                                    );
                                  }}
                                >
                                  <option value="">Select Location</option>
                                  {
                                    //   (this.props.country || []).map((team) => (
                                  //   <option
                                  //     key={team.countryId}
                                  //     value={team.countryId}
                                  //   >
                                  //     {team.countryName}
                                  //   </option>
                                  // ))
                                  (this.props.Location || []).map((team) => (
                                    <option
                                      
                                      value={team.codeValue === "Domestic" ? "India" : "International"}
                                    >
                                      {team.codeValue}
                                    </option>
                                  ))
                                  }
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="houseCountry"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Place/Location
                                </label>
                                <Field
                                  as="select"
                                  name="houseCategoryPlaceLocation"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;

                                    const houseCategoryPlaceLocationValue =
                                      event.target.value;
                                    const houseCategoryPlaceLocationName =
                                      event.nativeEvent.target[index].text;

                                    setFieldValue(
                                      (values.houseCategoryPlaceLocation = houseCategoryPlaceLocationValue)
                                    );
                                    //#region  call service for amount

                                    var HouseCategoryData = {
                                      property: {
                                        house_Category:
                                          values.houseCategoryName,
                                        country: values.houseCountryName,
                                        place_Location: houseCategoryPlaceLocationName,
                                      },
                                    };
                                    const userId = this.props.user.user.userId;

                                    goalServies.getCurrency(
                                      HouseCategoryData,
                                      userId,
                                      (res) => {
                                        if (res.data.status === "success") {
                                          // if(values.countryName==="India")
                                          // {
                                          // }
                                          // else{
                                          // setFieldValue(
                                          //   (values.currentValue =
                                          //     res.data.responseObject.Cost_in_INR)
                                          // );
                                          //   }
                                        } else {
                                        }
                                        setFieldValue(
                                          (values.currentValue =
                                            res.data.responseObject === null
                                              ? 7000000
                                              : res.data.responseObject
                                                  .Cost_in_INR)
                                        );

                                        var yearGap =
                                          Number(values.goalYear) -
                                          Number(values.goalStartYear);
                                        setFieldValue(
                                          (values.yearGap = yearGap)
                                        );

                                        var targetValueData = GoalCalculation.TargetValue(
                                          values.currentValue,
                                          values.inflationRateValues,
                                          values.yearGap
                                        );

                                        var assetallocatedvalueDetails = 0;
                                        {
                                          (values.assetAllocation || []).map(
                                            (assetAllocationDetail) =>
                                              (assetallocatedvalueDetails +=
                                                assetAllocationDetail.assetfuturevalue)
                                          );
                                        }

                                        var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                          assetallocatedvalueDetails,
                                          0,
                                          1
                                        );

                                        if (
                                          Number(targetValueData) <
                                          Number(AssetMappedValueData)
                                        ) {
                                          warning(
                                            "Asset mapped values should not be greater than target value...!",
                                            warningNotification
                                          );
                                          return;
                                        }

                                        var deficitValueData =
                                          targetValueData -
                                          Number(AssetMappedValueData);

                                        var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                          AssetMappedValueData,
                                          targetValueData
                                        );

                                        var lumSumValueData = GoalCalculation.lumSumValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        var SIPValueData = GoalCalculation.SIPValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        setFieldValue(
                                          (values.currentValue =
                                            values.currentValue),
                                          (values.targetValue = targetValueData.toFixed(
                                            0
                                          )),
                                          (values.assetMappedValue = AssetMappedValueData.toFixed(
                                            0
                                          )),
                                          (values.deficitValue = deficitValueData.toFixed(
                                            0
                                          )),
                                          (values.goalAchievementScaleValues = [
                                            GoalAchievementScaleData.toFixed(0),
                                          ]),
                                          (values.lumSumValue = lumSumValueData.toFixed(
                                            0
                                          )),
                                          (values.sipValue =
                                            SIPValueData === "Infinity"
                                              ? 0
                                              : SIPValueData.toFixed(0))
                                        );
                                      }
                                    );

                                    // #endregion  call service for amount
                                  }}
                                >
                                  <option value="">
                                    Select Place/Location
                                  </option>
                                  {(
                                    this.props.houseCategoryPlaceLocation || []
                                  ).map((houseCategoryPlaceLocation) => (
                                    <option
                                      key={
                                        houseCategoryPlaceLocation.codeValueId
                                      }
                                      value={JSON.stringify(
                                        houseCategoryPlaceLocation.codeValueId
                                      )}
                                    >
                                      {houseCategoryPlaceLocation.codeValue}
                                    </option>
                                  ))}{" "}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="houseCategoryPlaceLocation"
                                  className="text-danger"
                                />
                              </div>
                            </div>

                          <div className="col-sm-12 col-md-3  pl pr">
                          <div className="form-group">
                            <label>Property Description</label>

                            <Field
                              type="text"
                              name="description"
                              id="description"
                              className="form-control "
                              placeholder="Property Description"
                              
                            />
                          </div>
                        </div>

                          </div>
                        ) : null}
                        {values.vacation ? (
                          <div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Vacation Type
                                </label>
                                <Field
                                  as="select"
                                  name="vacationType"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;

                                    const vacationTypeValue =
                                      event.target.value;
                                    const vacationTypeName =
                                      event.nativeEvent.target[index].text;

                                    setFieldValue(
                                      (values.vacationType = vacationTypeValue),
                                      (values.vacationTypeName = vacationTypeName),
                                      (values.vacationCountry = ""),
                                      (values.vacationCountryName = "")
                                    );

                                    // #endregion  call service for amount
                                  }}
                                >
                                  <option value="">Select Vacation Type</option>
                                  {(this.props.vacationType || []).map(
                                    (vacationType) => (
                                      <option
                                        key={vacationType.codeValueId}
                                        value={JSON.stringify(
                                          vacationType.codeValueId
                                        )}
                                      >
                                        {vacationType.codeValue}
                                      </option>
                                    )
                                  )}{" "}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="vacationType"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Location
                                </label>
                                <Field
                                  as="select"
                                  name="vacationCountry"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;

                                    const vacationCountry = event.target.value;
                                    const vacationCountryName =
                                    event.target.value;

                                    setFieldValue(
                                      (values.vacationCountry = vacationCountry)
                                    );
                                    // #region  call service for amount

                                    var vacationData = {
                                      vacation: {
                                        country: vacationCountryName,
                                        vacation_Type: values.vacationTypeName,
                                      },
                                    };
                                    const userId = this.props.user.user.userId;

                                    goalServies.getCurrency(
                                      vacationData,
                                      userId,
                                      (res) => {
                                        if (res.data.status === "success") {
                                        } else {
                                        }

                                        setFieldValue(
                                          (values.currentValue =
                                            res.data.responseObject === null
                                              ? 250000
                                              : res.data.responseObject
                                                  .Cost_in_INR)
                                        );
                                        var yearGap =
                                          Number(values.goalYear) -
                                          Number(values.goalStartYear);
                                        setFieldValue(
                                          (values.yearGap = yearGap)
                                        );

                                        var targetValueData = GoalCalculation.TargetValue(
                                          values.currentValue,
                                          values.inflationRateValues,
                                          values.yearGap
                                        );

                                        var assetallocatedvalueDetails = 0;
                                        {
                                          (values.assetAllocation || []).map(
                                            (assetAllocationDetail) =>
                                              (assetallocatedvalueDetails +=
                                                assetAllocationDetail.assetfuturevalue)
                                          );
                                        }

                                        var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                          assetallocatedvalueDetails,
                                          0,
                                          1
                                        );

                                        if (
                                          Number(targetValueData) <
                                          Number(AssetMappedValueData)
                                        ) {
                                          warning(
                                            "Asset mapped values should not be greater than target value...!",
                                            warningNotification
                                          );
                                          return;
                                        }

                                        var deficitValueData =
                                          targetValueData -
                                          Number(AssetMappedValueData);

                                        var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                          AssetMappedValueData,
                                          targetValueData
                                        );

                                        var lumSumValueData = GoalCalculation.lumSumValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        var SIPValueData = GoalCalculation.SIPValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        setFieldValue(
                                          (values.currentValue =
                                            values.currentValue),
                                          (values.targetValue = targetValueData.toFixed(
                                            0
                                          )),
                                          (values.assetMappedValue = AssetMappedValueData.toFixed(
                                            0
                                          )),
                                          (values.deficitValue = deficitValueData.toFixed(
                                            0
                                          )),
                                          (values.goalAchievementScaleValues = [
                                            GoalAchievementScaleData.toFixed(0),
                                          ]),
                                          (values.lumSumValue = lumSumValueData.toFixed(
                                            0
                                          )),
                                          (values.sipValue =
                                            SIPValueData === "Infinity"
                                              ? 0
                                              : SIPValueData.toFixed(0))
                                        );
                                      }
                                    );

                                    // #endregion  call service for amount
                                  }}
                                >
                                  <option value="">Select Location</option>
                                  {
                                    //   (this.props.country || []).map((team) => (
                                  //   <option
                                  //     key={team.countryId}
                                  //     value={team.countryId}
                                  //   >
                                  //     {team.countryName}
                                  //   </option>
                                  // ))
                                  (this.props.Location || []).map((team) => (
                                    <option
                                      
                                      value={team.codeValue === "Domestic" ? "India" : "International"}
                                    >
                                      {team.codeValue}
                                    </option>
                                  ))
                                  }
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="vacationCountry"
                                  className="text-danger"
                                />
                              </div>
                            </div>

                            <div className="col-sm-12 col-md-3  pl pr">
                          <div className="form-group">
                            <label>Vacation Description</label>

                            <Field
                              type="text"
                              name="description"
                              id="description"
                              className="form-control "
                              placeholder="Vacation Description"
                              
                            />
                          </div>
                        </div>

                          </div>
                        ) : null}
                        {values.car ? (
                          <div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Car
                                </label>
                                <Field
                                  as="select"
                                  name="carMaker"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;

                                    setFieldValue(
                                      (values.carMaker = event.target.value),
                                      (values.carMakerName =
                                        event.nativeEvent.target[index].text),
                                      (values.carModelClass = "")
                                    );
                                  }}
                                >
                                  <option value="">Select Car Type</option>
                                  {(this.props.carMaker || []).map(
                                    (carMaker) => (
                                      <option
                                        key={carMaker.codeValueId}
                                        value={JSON.stringify(
                                          carMaker.codeValueId
                                        )}
                                      >
                                        {carMaker.codeValue}
                                      </option>
                                    )
                                  )}{" "}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="carMaker"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="" className="required">
                                  Car Model
                                </label>
                                <Field
                                  as="select"
                                  name="carModelClass"
                                  className="form-control"
                                  onChange={(event) => {
                                    var index =
                                      event.nativeEvent.target.selectedIndex;

                                    setFieldValue(
                                      (values.carModelClass =
                                        event.target.value)
                                      // (values.carModelClassName = carModelClassValuesName)
                                    );
                                    const carModelClassValuesName =
                                      event.nativeEvent.target[index].text;

                                    //#region  call service for amount

                                    var CarData = {
                                      vehicle: {
                                        car_Maker: values.carMakerName,
                                        //country: values.countryName,
                                        car_Model_Class: carModelClassValuesName,
                                      },
                                    };

                                    const userId = this.props.user.user.userId;

                                    goalServies.getCurrency(
                                      CarData,
                                      userId,
                                      (res) => {
                                        if (res.data.status === "success") {
                                        } else {
                                        }

                                        setFieldValue(
                                          (values.currentValue =
                                            res.data.responseObject === null
                                              ? 1000000
                                              : res.data.responseObject
                                                  .Cost_in_INR)
                                        );
                                        var yearGap =
                                          Number(values.goalYear) -
                                          Number(values.goalStartYear);
                                        setFieldValue(
                                          (values.yearGap = yearGap)
                                        );

                                        var targetValueData = GoalCalculation.TargetValue(
                                          values.currentValue,
                                          values.inflationRateValues,
                                          values.yearGap
                                        );

                                        var assetallocatedvalueDetails = 0;
                                        {
                                          (values.assetAllocation || []).map(
                                            (assetAllocationDetail) =>
                                              (assetallocatedvalueDetails +=
                                                assetAllocationDetail.assetfuturevalue)
                                          );
                                        }

                                        var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                          assetallocatedvalueDetails,
                                          0,
                                          1
                                        );

                                        if (
                                          Number(targetValueData) <
                                          Number(AssetMappedValueData)
                                        ) {
                                          warning(
                                            "Asset mapped values should not be greater than target value...!",
                                            warningNotification
                                          );
                                          return;
                                        }

                                        var deficitValueData =
                                          targetValueData -
                                          Number(AssetMappedValueData);

                                        var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                          AssetMappedValueData,
                                          targetValueData
                                        );

                                        var lumSumValueData = GoalCalculation.lumSumValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        var SIPValueData = GoalCalculation.SIPValueData(
                                          deficitValueData,
                                          values.growthRateValues,
                                          values.yearGap
                                        );

                                        setFieldValue(
                                          (values.currentValue =
                                            values.currentValue),
                                          (values.targetValue = targetValueData.toFixed(
                                            0
                                          )),
                                          (values.assetMappedValue = AssetMappedValueData.toFixed(
                                            0
                                          )),
                                          (values.deficitValue = deficitValueData.toFixed(
                                            0
                                          )),
                                          (values.goalAchievementScaleValues = [
                                            GoalAchievementScaleData.toFixed(0),
                                          ]),
                                          (values.lumSumValue = lumSumValueData.toFixed(
                                            0
                                          )),
                                          (values.sipValue =
                                            SIPValueData === "Infinity"
                                              ? 0
                                              : SIPValueData.toFixed(0))
                                        );
                                      }
                                    );

                                    // #endregion  call service for amount
                                  }}
                                >
                                  <option value="">Select Car Model</option>
                                  {(this.props.carModelClass || []).map(
                                    (carModelClass) => (
                                      <option
                                        key={carModelClass.codeValueId}
                                        value={JSON.stringify(
                                          carModelClass.codeValueId
                                        )}
                                      >
                                        {carModelClass.codeValue}
                                      </option>
                                    )
                                  )}{" "}
                                </Field>
                                <ErrorMessage
                                  component="div"
                                  name="carModelClass"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                        <div className="clearfix"></div>
                      </div>
                      <div className="clearfix"></div>
                    </div>

                    {values.retirement ? (
                      <div>
                        <div className="col-sm-12 col-md-8 assumption-col">
                          <div className="assumption-details">
                            <div className="assumption-sub-title">
                              Input &amp; Assumption
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="">Current Age</label>

                                <Field
                                  type="number"
                                  id="currentAge"
                                  name="currentAge"
                                  placeholder="Current Age"
                                  disabled
                                  className={`form-control ${
                                    touched.currentAge && errors.currentAge
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  component="div"
                                  name="currentAge"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="">Retirement Age</label>
                                <Field
                                  type="number"
                                  id="retirementAge"
                                  name="retirementAge"
                                  placeholder="Retirement Age"
                                  className={`form-control ${
                                    touched.retirementAge &&
                                    errors.retirementAge
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  onChange={(event) => {
                                    var retirementAgeDetails = Number(
                                      event.target.value
                                    );

                                    setFieldValue(
                                      (values.retirementAge = retirementAgeDetails)
                                    );

                                    // Messages code

                                    //#region retirementCalculation

                                    var NoOfYearsLeftForRetirementValues =
                                      values.retirementAge - values.currentAge;
                                    var YearsAfterRetirementValues =
                                      values.lifeExpectancy -
                                      values.retirementAge;

                                    var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                      values.currentHouseAndLifeStyleExpenses,
                                      values.inflationRateValuesRetirement,
                                      NoOfYearsLeftForRetirementValues
                                    );

                                    var FirstYearExpenseAfterRetirementPostDetails =
                                      Number(
                                        FirstMonthExpenseAfterRetirementDetails
                                      ) * 12;

                                    var FirstYearExpenseAfterRetirementPre =
                                      FirstYearExpenseAfterRetirementPostDetails /
                                      (1 - 0.2);

                                    var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                      values.expectedPostRetirementReturn,
                                      values.inflationRateValuesRetirement
                                    );

                                    var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                      RateOtherhideCalculation,
                                      YearsAfterRetirementValues,
                                      FirstYearExpenseAfterRetirementPre
                                    );

                                    var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                      values.expectedPreRetirementReturn,
                                      YearsAfterRetirementValues,
                                      RetirementCorpusRequiredDetails
                                    );

                                    var TotalCorpusRequiredDetails =
                                      RetirementCorpusRequiredDetails +
                                      FundYouMustDetails;

                                    var assetallocatedvalueDetails = 0;
                                    {
                                      (values.assetAllocation || []).map(
                                        (assetAllocationDetail) =>
                                          (assetallocatedvalueDetails +=
                                            assetAllocationDetail.assetfuturevalue)
                                      );
                                    }

                                    var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                      Number(assetallocatedvalueDetails),
                                      0,
                                      1
                                    );
                                    if (
                                      Number(TotalCorpusRequiredDetails) <
                                      Number(AssetMappedValueData)
                                    ) {
                                     
                                      warning(
                                        "Asset mapped values should not be greater than total retirement corpus...!",
                                        warningNotification
                                      );
                                      return;
                                    }
                                    //end asset mapped values
                                    var deficitValueData =
                                      Number(TotalCorpusRequiredDetails) -
                                      Number(AssetMappedValueData);
                                    // RetirementCorpusRequiredDetails +
                                    // FundYouMustDetails;

                                    var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                      AssetMappedValueData,
                                      TotalCorpusRequiredDetails
                                    );

                                    var lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                      values.expectedPreRetirementReturn,
                                      NoOfYearsLeftForRetirementValues,
                                      deficitValueData
                                    );

                                    var SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                      values.expectedPreRetirementReturn,
                                      NoOfYearsLeftForRetirementValues,
                                      deficitValueData
                                    );

                                    //#endregion

                                    setFieldValue(
                                      (values.retirementYear =
                                        values.goalStartYear +
                                        NoOfYearsLeftForRetirementValues),
                                      (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                      (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                      (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                        0
                                      )),
                                      (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                        0
                                      )),
                                      (values.FundYouMust = FundYouMustDetails.toFixed(
                                        0
                                      )),
                                      (values.goalAchievementScaleValues = [
                                        GoalAchievementScaleData.toFixed(0),
                                      ]),
                                      (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                        0
                                      )),
                                      (values.assetMappedValue = AssetMappedValueData.toFixed(
                                        0
                                      )),
                                      (values.deficitValue = deficitValueData.toFixed(
                                        0
                                      )),
                                      (values.lumSumValue = lumSumValueData.toFixed(
                                        0
                                      )),
                                      (values.sipValue = SIPValueData.toFixed(
                                        0
                                      ))
                                    );
                                  }}
                                />
                                <ErrorMessage
                                  component="div"
                                  name="retirementAge"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="">Retirement Year</label>
                                <Field
                                  type="number"
                                  id="retirementYear"
                                  name="retirementYear"
                                  disabled
                                  placeholder="Retirement Year"
                                  className={`form-control ${
                                    touched.retirementYear &&
                                    errors.retirementYear
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  component="div"
                                  name="retirementYear"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                            <div className="col-sm-12 col-md-3 pl pr">
                              <div className="form-group">
                                <label htmlFor="">Life Expectancy</label>
                                <Field
                                  type="number"
                                  id="lifeExpectancy"
                                  name="lifeExpectancy"
                                  placeholder="Life Expectancy"
                                  className={`form-control ${
                                    touched.lifeExpectancy &&
                                    errors.lifeExpectancy
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  onChange={(event) => {
                                    var LifeExpectancyDetails = Number(
                                      event.target.value
                                    );

                                    setFieldValue(
                                      (values.lifeExpectancy = LifeExpectancyDetails)
                                    );

                                    //#region retirementCalculation

                                    var NoOfYearsLeftForRetirementValues =
                                      values.retirementAge - values.currentAge;
                                    var YearsAfterRetirementValues =
                                      values.lifeExpectancy -
                                      values.retirementAge;

                                    var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                      values.currentHouseAndLifeStyleExpenses,
                                      values.inflationRateValuesRetirement,
                                      NoOfYearsLeftForRetirementValues
                                    );

                                    var FirstYearExpenseAfterRetirementPostDetails =
                                      Number(
                                        FirstMonthExpenseAfterRetirementDetails
                                      ) * 12;

                                    var FirstYearExpenseAfterRetirementPre =
                                      FirstYearExpenseAfterRetirementPostDetails /
                                      (1 - 0.2);

                                    var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                      values.expectedPostRetirementReturn,
                                      values.inflationRateValuesRetirement
                                    );

                                    var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                      RateOtherhideCalculation,
                                      YearsAfterRetirementValues,
                                      FirstYearExpenseAfterRetirementPre
                                    );

                                    var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                      values.expectedPreRetirementReturn,
                                      YearsAfterRetirementValues,
                                      RetirementCorpusRequiredDetails
                                    );

                                    var TotalCorpusRequiredDetails =
                                      RetirementCorpusRequiredDetails +
                                      FundYouMustDetails;

                                    var assetallocatedvalueDetails = 0;
                                    {
                                      (values.assetAllocation || []).map(
                                        (assetAllocationDetail) =>
                                          (assetallocatedvalueDetails +=
                                            assetAllocationDetail.assetfuturevalue)
                                      );
                                    }

                                    var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                      Number(assetallocatedvalueDetails),
                                      0,
                                      1
                                    );
                                    if (
                                      Number(TotalCorpusRequiredDetails) <
                                      Number(AssetMappedValueData)
                                    ) {
                                     
                                      warning(
                                        "Asset mapped values should not be greater than total retirement corpus...!",
                                        warningNotification
                                      );
                                      return;
                                    }
                                    //end asset mapped values
                                    var deficitValueData =
                                      Number(TotalCorpusRequiredDetails) -
                                      Number(AssetMappedValueData);
                                    // RetirementCorpusRequiredDetails +
                                    // FundYouMustDetails;

                                    var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                      AssetMappedValueData,
                                      TotalCorpusRequiredDetails
                                    );

                                    var lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                      values.expectedPreRetirementReturn,
                                      NoOfYearsLeftForRetirementValues,
                                      deficitValueData
                                    );

                                    var SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                      values.expectedPreRetirementReturn,
                                      NoOfYearsLeftForRetirementValues,
                                      deficitValueData
                                    );

                                    //#endregion

                                    setFieldValue(
                                      (values.retirementYear =
                                        values.goalStartYear +
                                        NoOfYearsLeftForRetirementValues),
                                      (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                      (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                      (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                        0
                                      )),
                                      (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                        0
                                      )),
                                      (values.FundYouMust = FundYouMustDetails.toFixed(
                                        0
                                      )),
                                      (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                        0
                                      )),
                                      (values.assetMappedValue = AssetMappedValueData.toFixed(
                                        0
                                      )),
                                      (values.goalAchievementScaleValues = [
                                        GoalAchievementScaleData.toFixed(0),
                                      ]),
                                      (values.deficitValue = deficitValueData.toFixed(
                                        0
                                      )),
                                      (values.lumSumValue = lumSumValueData.toFixed(
                                        0
                                      )),
                                      (values.sipValue = SIPValueData.toFixed(
                                        0
                                      ))
                                    );
                                  }}
                                />
                                <ErrorMessage
                                  component="div"
                                  name="lifeExpectancy"
                                  className="text-danger"
                                />
                              </div>
                            </div>

                            <div className="col-sm-12 col-md-6 pl pr">
                              <div className="form-group">
                                <label htmlFor="">
                                  Current Household and Lifestyle Expenses
                                </label>

                                <Field
                                  type="text"
                                  id="currentHouseAndLifeStyleExpenses"
                                  name="currentHouseAndLifeStyleExpenses"
                                  placeholder="Current Household and Lifestyle Expenses"
                                  className={`form-control ${
                                    touched.currentHouseAndLifeStyleExpenses &&
                                    errors.currentHouseAndLifeStyleExpenses
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  onChange={(event) => {
                                   
                                    setFieldValue(
                                      (values.currentHouseAndLifeStyleExpenses =
                                        event.target.value)
                                    );
                                   
                                    var currentHouseAndLifeStyleExpensesdetail = Number(
                                      event.target.value
                                    );
                                   
                                    setFieldValue(
                                      (values.currentHouseAndLifeStyleExpenses = currentHouseAndLifeStyleExpensesdetail)
                                    );

                                    //#region retirementCalculation
                                   
                                    var NoOfYearsLeftForRetirementValues =
                                      values.retirementAge - values.currentAge;
                                    var YearsAfterRetirementValues =
                                      values.lifeExpectancy -
                                      values.retirementAge;

                                    var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                      Number(
                                        Number(
                                          currentHouseAndLifeStyleExpensesdetail
                                        ) +
                                          Number(
                                            values.netAdditionOrDeductionDetails ||
                                              0
                                          )
                                      ),
                                      values.inflationRateValuesRetirement,
                                      NoOfYearsLeftForRetirementValues
                                    );

                                    var FirstYearExpenseAfterRetirementPostDetails =
                                      Number(
                                        FirstMonthExpenseAfterRetirementDetails
                                      ) * 12;

                                    var FirstYearExpenseAfterRetirementPre =
                                      FirstYearExpenseAfterRetirementPostDetails /
                                      (1 - 0.2);

                                    var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                      values.expectedPostRetirementReturn,
                                      values.inflationRateValuesRetirement
                                    );

                                    var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                      RateOtherhideCalculation,
                                      YearsAfterRetirementValues,
                                      FirstYearExpenseAfterRetirementPre
                                    );

                                    var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                      values.expectedPreRetirementReturn,
                                      YearsAfterRetirementValues,
                                      RetirementCorpusRequiredDetails
                                    );

                                    var TotalCorpusRequiredDetails =
                                      RetirementCorpusRequiredDetails +
                                      FundYouMustDetails;

                                    var assetallocatedvalueDetails = 0;
                                    {
                                      (values.assetAllocation || []).map(
                                        (assetAllocationDetail) =>
                                          (assetallocatedvalueDetails +=
                                            assetAllocationDetail.assetfuturevalue)
                                      );
                                    }

                                    var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                      Number(assetallocatedvalueDetails),
                                      0,
                                      1
                                    );
                                    if (
                                      Number(TotalCorpusRequiredDetails) <
                                      Number(AssetMappedValueData)
                                    ) {
                                      
                                      warning(
                                        "Asset mapped values should not be greater than total retirement corpus...!",
                                        warningNotification
                                      );
                                      return;
                                    }
                                    //end asset mapped values
                                    var deficitValueData =
                                      Number(TotalCorpusRequiredDetails) -
                                      Number(AssetMappedValueData);
                                    // RetirementCorpusRequiredDetails +
                                    // FundYouMustDetails;

                                    var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                      AssetMappedValueData,
                                      TotalCorpusRequiredDetails
                                    );

                                    var lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                      values.expectedPreRetirementReturn,
                                      NoOfYearsLeftForRetirementValues,
                                      deficitValueData
                                    );

                                    var SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                      values.expectedPreRetirementReturn,
                                      NoOfYearsLeftForRetirementValues,
                                      deficitValueData
                                    );

                                    //#endregion

                                    setFieldValue(
                                      (values.retirementYear =
                                        values.goalStartYear +
                                        NoOfYearsLeftForRetirementValues),
                                      (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                      (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                      (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                        0
                                      )),
                                      (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                        0
                                      )),
                                      (values.FundYouMust = FundYouMustDetails.toFixed(
                                        0
                                      )),
                                      (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                        0
                                      )),
                                      (values.assetMappedValue = AssetMappedValueData.toFixed(
                                        0
                                      )),
                                      (values.goalAchievementScaleValues = [
                                        GoalAchievementScaleData.toFixed(0),
                                      ]),
                                      (values.deficitValue = deficitValueData.toFixed(
                                        0
                                      )),
                                      (values.lumSumValue = lumSumValueData.toFixed(
                                        0
                                      )),
                                      (values.sipValue = SIPValueData.toFixed(
                                        0
                                      ))
                                    );
                                  }}
                                />
                                <ErrorMessage
                                  component="div"
                                  name="currentHouseAndLifeStyleExpenses"
                                  className="text-danger"
                                />
                                <span className="currency-word">
                                  <CurrencyWordFormat
                                    state={
                                      values.currentHouseAndLifeStyleExpenses
                                    }
                                  ></CurrencyWordFormat>
                                </span>
                              </div>
                            </div>

                            <div className="col-sm-12 col-md-6 pl pr">
                              <div className="form-group">
                                <label htmlFor="">Net Addition/Deduction</label>
                                <Field
                                  type="number"
                                  id="netAdditionOrDeduction"
                                  name="netAdditionOrDeduction"
                                  placeholder="Net Addition/Deduction"
                                  className={`form-control ${
                                    touched.netAdditionOrDeduction &&
                                    errors.netAdditionOrDeduction
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  onChange={(event) => {
                                    var netAdditionOrDeductionDetails = Number(
                                      event.target.value
                                    );

                                    setFieldValue(
                                      (values.netAdditionOrDeduction = netAdditionOrDeductionDetails)
                                    );

                                    //#region retirementCalculation

                                    var NoOfYearsLeftForRetirementValues =
                                      values.retirementAge - values.currentAge;
                                    var YearsAfterRetirementValues =
                                      values.lifeExpectancy -
                                      values.retirementAge;

                                    var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                      Number(
                                        values.currentHouseAndLifeStyleExpenses +
                                          netAdditionOrDeductionDetails
                                      ),
                                      values.inflationRateValuesRetirement,
                                      NoOfYearsLeftForRetirementValues
                                    );

                                    var FirstYearExpenseAfterRetirementPostDetails =
                                      Number(
                                        FirstMonthExpenseAfterRetirementDetails
                                      ) * 12;

                                    var FirstYearExpenseAfterRetirementPre =
                                      FirstYearExpenseAfterRetirementPostDetails /
                                      (1 - 0.2);

                                    var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                      values.expectedPostRetirementReturn,
                                      values.inflationRateValuesRetirement
                                    );

                                    var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                      RateOtherhideCalculation,
                                      YearsAfterRetirementValues,
                                      FirstYearExpenseAfterRetirementPre
                                    );

                                    var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                      values.expectedPreRetirementReturn,
                                      YearsAfterRetirementValues,
                                      RetirementCorpusRequiredDetails
                                    );

                                    var TotalCorpusRequiredDetails =
                                      RetirementCorpusRequiredDetails +
                                      FundYouMustDetails;

                                    var assetallocatedvalueDetails = 0;
                                    {
                                      (values.assetAllocation || []).map(
                                        (assetAllocationDetail) =>
                                          (assetallocatedvalueDetails +=
                                            assetAllocationDetail.assetfuturevalue)
                                      );
                                    }

                                    var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                      Number(assetallocatedvalueDetails),
                                      0,
                                      1
                                    );
                                    if (
                                      Number(TotalCorpusRequiredDetails) <
                                      Number(AssetMappedValueData)
                                    ) {
                                      
                                      warning(
                                        "Asset mapped values should not be greater than total retirement corpus...!",
                                        warningNotification
                                      );
                                      return;
                                    }
                                    //end asset mapped values
                                    var deficitValueData =
                                      Number(TotalCorpusRequiredDetails) -
                                      Number(AssetMappedValueData);
                                    // RetirementCorpusRequiredDetails +
                                    // FundYouMustDetails;

                                    var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                      AssetMappedValueData,
                                      TotalCorpusRequiredDetails
                                    );

                                    var lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                      values.expectedPreRetirementReturn,
                                      NoOfYearsLeftForRetirementValues,
                                      deficitValueData
                                    );

                                    var SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                      values.expectedPreRetirementReturn,
                                      NoOfYearsLeftForRetirementValues,
                                      deficitValueData
                                    );

                                    //#endregion

                                    setFieldValue(
                                      (values.retirementYear =
                                        values.goalStartYear +
                                        NoOfYearsLeftForRetirementValues),
                                      (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                      (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                      (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                        0
                                      )),
                                      (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                        0
                                      )),
                                      (values.FundYouMust = FundYouMustDetails.toFixed(
                                        0
                                      )),
                                      (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                        0
                                      )),
                                      (values.assetMappedValue = AssetMappedValueData.toFixed(
                                        0
                                      )),
                                      (values.goalAchievementScaleValues = [
                                        GoalAchievementScaleData.toFixed(0),
                                      ]),
                                      (values.deficitValue = deficitValueData.toFixed(
                                        0
                                      )),
                                      (values.lumSumValue = lumSumValueData.toFixed(
                                        0
                                      )),
                                      (values.sipValue = SIPValueData.toFixed(
                                        0
                                      ))
                                    );
                                  }}
                                />
                                <ErrorMessage
                                  component="div"
                                  name="netAdditionOrDeduction"
                                  className="text-danger"
                                />
                                <span className="currency-word">
                                  <CurrencyWordFormat
                                    state={values.netAdditionOrDeduction}
                                  ></CurrencyWordFormat>
                                </span>
                              </div>
                            </div>

                            <div className="clearfix"></div>
                          </div>

                          <div className="clearfix"></div>
                        </div>
                        <div className="col-sm-12 col-md-4 pl pr result-col">
                          <div className="assumption-result-title">Results</div>

                          <ul className="goal-results">
                            <li>
                              <div className="result-count">
                                No of years left for retirement
                              </div>
                              <div className="result-all-count">
                                {values.NoOfYearsLeftForRetirement}
                              </div>
                              <div className="clearfix"></div>
                            </li>
                            <li>
                              <div className="result-count">
                                Years after retirement
                              </div>
                              <div className="result-all-count">
                                {values.YearsAfterRetirement}
                              </div>
                              <div className="clearfix"></div>
                            </li>
                            <li>
                              <div className="result-count">
                                1st Month expense after retirement
                              </div>
                              <div
                                className="result-all-count"
                                title={values.FirstMonthExpenseAfterRetirement.toString().replace(
                                  /(\d)(?=(\d\d)+\d$)/g,
                                  "$1,"
                                )}
                              >
                                <CurrencyValue
                                  state={
                                    values.FirstMonthExpenseAfterRetirement || 0
                                  }
                                ></CurrencyValue>
                              </div>
                              <div className="clearfix"></div>
                            </li>
                            <li>
                              <div className="result-count">
                                Retirement corpus required
                              </div>
                              <div
                                className="result-all-count"
                                data-toggle="tooltip"
                                title={values.RetirementCorpusRequired.toString().replace(
                                  /(\d)(?=(\d\d)+\d$)/g,
                                  "$1,"
                                )}
                              >
                                <CurrencyValue
                                  state={values.RetirementCorpusRequired}
                                ></CurrencyValue>
                              </div>
                              <div className="clearfix"></div>
                            </li>
                            <li>
                              <div className="result-count">
                                Fund you must set aside at retirement age to get
                                your capital back
                              </div>
                              <div
                                className="result-all-count"
                                title={values.FundYouMust.toString().replace(
                                  /(\d)(?=(\d\d)+\d$)/g,
                                  "$1,"
                                )}
                              >
                                <CurrencyValue
                                  state={values.FundYouMust || 0}
                                ></CurrencyValue>
                              </div>
                              <div className="clearfix"></div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : null}

                    <div className="col-sm-12 col-md-4 pl pr"></div>
                    {!values.retirement ? (
                      <div className="col-sm-12 col-md-12 progress-div ">
                        <div className="col-sm-12 col-md-3 pl pr col-width-22">
                          <div className="form-group">
                            <label htmlFor="" className="required">
                              Current Value (INR)
                            </label>
                            <Field
                              type="number"
                              id="currentValue"
                              name="currentValue"
                              placeholder="Current Value (INR)"
                              min="1"
                              max="9999999999"
                              className={`form-control ${
                                touched.currentValue && errors.currentValue
                                  ? "is-invalid"
                                  : ""
                              }`}
                              onChange={(event) => {
                                // values.targetValue = 0;

                                setFieldValue((values.targetValue = 0));
                                const curentvalueData = Number(
                                  event.target.value
                                );
                                setFieldValue(
                                  (values.targetValue = curentvalueData),
                                  (values.deficitValue = 0),
                                  (values.goalAchievementScaleValues = [0]),
                                  (values.lumSumValue = 0),
                                  (values.sipValue = 0)
                                );
                                if (
                                  Number(values.targetValue) <
                                  Number(values.assetMappedValue)
                                ) {
                                  warning(
                                    "Asset mapped values should not be greater than target value...!",
                                    warningNotification
                                  );
                                  return;
                                }

                                setFieldValue(
                                  (values.currentValue =
                                    curentvalueData === 0
                                      ? ""
                                      : curentvalueData)
                                );

                                var yearGap =
                                  Number(values.goalYear) -
                                  Number(values.goalStartYear);

                                setFieldValue(
                                    (values.yearGap = yearGap)
                                  ); 
                                var targetValueData = GoalCalculation.TargetValue(
                                  values.currentValue,
                                  values.inflationRateValues,
                                  values.yearGap
                                );

                                var assetallocatedvalueDetails = 0;
                                {
                                  (values.assetAllocation || []).map(
                                    (assetAllocationDetail) =>
                                      (assetallocatedvalueDetails +=
                                        assetAllocationDetail.assetfuturevalue)
                                  );
                                }

                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                  assetallocatedvalueDetails,
                                  0,
                                  1
                                );

                                if (
                                  Number(targetValueData) <
                                  Number(AssetMappedValueData)
                                ) {
                                  warning(
                                    "Asset mapped values should not be greater than target value...!",
                                    warningNotification
                                  );
                                  return;
                                }

                                var deficitValueData =
                                  targetValueData -
                                  Number(AssetMappedValueData);

                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                  AssetMappedValueData,
                                  targetValueData
                                );

                                var lumSumValueData = GoalCalculation.lumSumValueData(
                                  deficitValueData,
                                  values.growthRateValues,
                                  values.yearGap
                                );

                                var SIPValueData = GoalCalculation.SIPValueData(
                                  deficitValueData,
                                  values.growthRateValues,
                                  values.yearGap
                                );

                                setFieldValue(
                                  (values.currentValue = values.currentValue),
                                  (values.targetValue = targetValueData.toFixed(
                                    0
                                  )),
                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                    0
                                  )),
                                  (values.deficitValue = deficitValueData.toFixed(
                                    0
                                  )),
                                  (values.goalAchievementScaleValues = [
                                    GoalAchievementScaleData.toFixed(0),
                                  ]),
                                  (values.lumSumValue = lumSumValueData.toFixed(
                                    0
                                  )),
                                  (values.sipValue =
                                    SIPValueData === "Infinity"
                                      ? 0
                                      : SIPValueData.toFixed(0))
                                );
                              }}
                            />
                            <ErrorMessage
                              component="div"
                              name="currentValue"
                              className="text-danger"
                            />
                            <span className="currency-word">
                              <CurrencyWordFormat
                                state={values.currentValue}
                              ></CurrencyWordFormat>
                            </span>
                          </div>
                        </div>
                        <div className="col-sm-12 col-md-4 prog-box-one smallwidth pl pr">
                          <div className="form-group">
                            <label>Inflation Rate (%)</label>

                            <Field
                              type="number"
                              name="inflationRateValues"
                              id="inflationRateValues"
                              //maxLength="4"
                              min="1"
                              max="100"
                              step="0.1"
                              className={
                                "form-control mod-input" +
                                (errors.inflationRateValues &&
                                touched.inflationRateValues
                                  ? " is-invalid"
                                  : "")
                              }
                              placeholder="Inflation Rate"
                              onChange={(event) => {

                                debugger;
                                console.log("1st");
                                setFieldValue(
                                  (values.inflationRateValues =
                                    event.target.value)
                                );
                                setFieldValue(
                                  (values.targetValue = 0),
                                  (values.deficitValue = 0),
                                  (values.goalAchievementScaleValues = [0]),
                                  (values.lumSumValue = 0),
                                  (values.sipValue = 0)
                                );
                                var yearGap =
                                  Number(values.goalYear) -
                                  Number(values.goalStartYear);

                                  setFieldValue(
                                    (values.yearGap = yearGap),
                                  );  
                                var targetValueData = GoalCalculation.TargetValue(
                                  values.currentValue,
                                  values.inflationRateValues,
                                  values.yearGap
                                );

                                var assetallocatedvalueDetails = 0;
                                {
                                  (values.assetAllocation || []).map(
                                    (assetAllocationDetail) =>
                                      (assetallocatedvalueDetails +=
                                        assetAllocationDetail.assetfuturevalue)
                                  );
                                }

                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                  assetallocatedvalueDetails,
                                  0,
                                  1
                                );

                                if (
                                  Number(targetValueData) <
                                  Number(AssetMappedValueData)
                                ) {
                                  warning(
                                    "Asset mapped values should not be greater than target value...!",
                                    warningNotification
                                  );
                                  return;
                                }

                                var deficitValueData =
                                  targetValueData -
                                  Number(AssetMappedValueData);

                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                  AssetMappedValueData,
                                  targetValueData
                                );

                                var lumSumValueData = GoalCalculation.lumSumValueData(
                                  deficitValueData,
                                  values.growthRateValues,
                                  values.yearGap
                                );

                                var SIPValueData = GoalCalculation.SIPValueData(
                                  deficitValueData,
                                  values.growthRateValues,
                                  values.yearGap
                                );

                                {
                                  (values.assetAllocation || []).map(
                                    (assetAllocationDetail) =>
                                      (assetallocatedvalueDetails +=
                                        assetAllocationDetail.assetfuturevalue)
                                  );
                                }
                                setFieldValue(
                                  (values.currentValue = values.currentValue),
                                  (values.targetValue = targetValueData.toFixed(
                                    0
                                  )),
                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                    0
                                  )),
                                  (values.deficitValue = deficitValueData.toFixed(
                                    0
                                  )),
                                  (values.goalAchievementScaleValues = [
                                    GoalAchievementScaleData.toFixed(0),
                                  ]),
                                  (values.lumSumValue = lumSumValueData.toFixed(
                                    0
                                  )),
                                  (values.sipValue =
                                    SIPValueData === "Infinity"
                                      ? 0
                                      : SIPValueData.toFixed(0))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-sm-12 col-md-4 prog-box-one smallwidth pl pr hidereturnsrate">
                          <div className="form-group">
                            <label>Returns Rate (%)</label>

                            <Field
                              type="number"
                              name="growthRateValues"
                              id="growthRateValues"
                              min="0"
                              max="100"
                              step="0.1"
                              value ={values.growthRateValues}
                              className={
                                "form-control mod-input " +
                                (errors.growthRateValues &&
                                touched.growthRateValues
                                  ? " is-invalid"
                                  : "")
                              }
                              placeholder="Returns Rate"
                              onChange={(event) => {
                                // setFieldValue(
                                //   (values.growthRateValues = 0)
                                // );
                                setFieldValue(
                                  (values.targetValue = 0),
                                  (values.deficitValue = 0),
                                  (values.goalAchievementScaleValues = [0]),
                                  (values.lumSumValue = 0),
                                  (values.sipValue = 0)
                                );
                                var yearGap =
                                  Number(values.goalYear) -
                                  Number(values.goalStartYear);

                                var targetValueData = GoalCalculation.TargetValue(
                                  values.currentValue,
                                  values.inflationRateValues,
                                  values.yearGap
                                );

                                var assetallocatedvalueDetails = 0;
                                {
                                  (values.assetAllocation || []).map(
                                    (assetAllocationDetail) =>
                                      (assetallocatedvalueDetails +=
                                        assetAllocationDetail.assetfuturevalue)
                                  );
                                }

                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                  assetallocatedvalueDetails,
                                  0,
                                  1
                                );

                                if (
                                  Number(targetValueData) <
                                  Number(AssetMappedValueData)
                                ) {
                                  warning(
                                    "Asset mapped values should not be greater than target value...!",
                                    warningNotification
                                  );
                                  return;
                                }

                                var deficitValueData =
                                  targetValueData -
                                  Number(AssetMappedValueData);

                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                  AssetMappedValueData,
                                  targetValueData
                                );

                                var lumSumValueData = GoalCalculation.lumSumValueData(
                                  deficitValueData,
                                  values.growthRateValues,
                                  values.yearGap
                                );

                                var SIPValueData = GoalCalculation.SIPValueData(
                                  deficitValueData,
                                  values.growthRateValues,
                                  values.yearGap
                                );

                                setFieldValue(
                                  (values.currentValue = values.currentValue),
                                  (values.targetValue = targetValueData.toFixed(
                                    0
                                  )),
                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                    0
                                  )),
                                  (values.deficitValue = deficitValueData.toFixed(
                                    0
                                  )),
                                  (values.goalAchievementScaleValues = [
                                    GoalAchievementScaleData.toFixed(0),
                                  ]),
                                  (values.lumSumValue = lumSumValueData.toFixed(
                                    0
                                  )),
                                  (values.sipValue =
                                    SIPValueData === "Infinity"
                                      ? 0
                                      : SIPValueData.toFixed(0))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="clearfix"></div>
                      </div>
                    ) : null}
                    {values.retirement ? (
                      <div>
                        <div class="clearfix"></div>

                        <div className="col-sm-12 col-md-4 rate-prog-box-one smallwidth pl pr">
                          <div className="form-group">
                            <label>Inflation Rate (%)</label>
                            <Field
                              type="number"
                              name="inflationRateValuesRetirement"
                              id="inflationRateValuesRetirement"
                              min="1"
                              max="100"
                              step="0.1"
                              className={
                                "form-control mod-input" +
                                (errors.inflationRateValuesRetirement &&
                                touched.inflationRateValuesRetirement
                                  ? " is-invalid"
                                  : "")
                              }
                              placeholder="Returns Rate"
                              onChange={(event) => {
                                // var inflationRateValuesRetirementdetail =
                                //   event[0];
                                debugger;
                                console.log("2nd");
                                setFieldValue(
                                  (values.inflationRateValuesRetirement =
                                    event.target.value)
                                );

                                //#region retirementCalculation

                                var NoOfYearsLeftForRetirementValues =
                                  values.retirementAge - values.currentAge;
                                var YearsAfterRetirementValues =
                                  values.lifeExpectancy - values.retirementAge;

                                var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                  values.currentHouseAndLifeStyleExpenses,
                                  values.inflationRateValuesRetirement,
                                  NoOfYearsLeftForRetirementValues
                                );

                                var FirstYearExpenseAfterRetirementPostDetails =
                                  Number(
                                    FirstMonthExpenseAfterRetirementDetails
                                  ) * 12;

                                var FirstYearExpenseAfterRetirementPre =
                                  FirstYearExpenseAfterRetirementPostDetails /
                                  (1 - 0.2);

                                var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                  values.expectedPostRetirementReturn,
                                  values.inflationRateValuesRetirement
                                );

                                var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                  RateOtherhideCalculation,
                                  YearsAfterRetirementValues,
                                  FirstYearExpenseAfterRetirementPre
                                );

                                var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                  values.expectedPreRetirementReturn,
                                  YearsAfterRetirementValues,
                                  RetirementCorpusRequiredDetails
                                );

                                var TotalCorpusRequiredDetails =
                                  RetirementCorpusRequiredDetails +
                                  FundYouMustDetails;

                                var assetallocatedvalueDetails = 0;
                                {
                                  (values.assetAllocation || []).map(
                                    (assetAllocationDetail) =>
                                      (assetallocatedvalueDetails +=
                                        assetAllocationDetail.assetfuturevalue)
                                  );
                                }

                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                  Number(assetallocatedvalueDetails),
                                  0,
                                  1
                                );
                                if (
                                  Number(TotalCorpusRequiredDetails) <
                                  Number(AssetMappedValueData)
                                ) {
                                 
                                  warning(
                                    "Asset mapped values should not be greater than total retirement corpus...!",
                                    warningNotification
                                  );
                                  return;
                                }
                                //end asset mapped values
                                var deficitValueData =
                                  Number(TotalCorpusRequiredDetails) -
                                  Number(AssetMappedValueData);
                                // RetirementCorpusRequiredDetails +
                                // FundYouMustDetails;

                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                  AssetMappedValueData,
                                  TotalCorpusRequiredDetails
                                );

                                var lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                  values.expectedPreRetirementReturn,
                                  NoOfYearsLeftForRetirementValues,
                                  deficitValueData
                                );

                                var SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                  values.expectedPreRetirementReturn,
                                  NoOfYearsLeftForRetirementValues,
                                  deficitValueData
                                );

                                //#endregion

                                setFieldValue(
                                  (values.retirementYear =
                                    values.goalStartYear +
                                    NoOfYearsLeftForRetirementValues),
                                  (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                  (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                  (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                    0
                                  )),
                                  (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                    0
                                  )),
                                  (values.FundYouMust = FundYouMustDetails.toFixed(
                                    0
                                  )),
                                  (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                    0
                                  )),
                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                    0
                                  )),
                                  (values.goalAchievementScaleValues = [
                                    GoalAchievementScaleData.toFixed(0),
                                  ]),
                                  (values.deficitValue = deficitValueData.toFixed(
                                    0
                                  )),
                                  (values.lumSumValue = lumSumValueData.toFixed(
                                    0
                                  )),
                                  (values.sipValue = SIPValueData.toFixed(0))
                                );
                              }}
                            />
                            <div className="clearfix"></div>
                          </div>
                        </div>

                        <div className="col-sm-12 col-md-4 rate-prog-box-one smallwidth	pl pr">
                          <div className="form-group">
                            <label>Expected Post Retirement Return (%)</label>
                            <Field
                              type="number"
                              name="expectedPostRetirementReturn"
                              id="expectedPostRetirementReturn"
                              min="1"
                              max="100"
                              className={
                                "form-control mod-input" +
                                (errors.expectedPostRetirementReturn &&
                                touched.expectedPostRetirementReturn
                                  ? " is-invalid"
                                  : "")
                              }
                              placeholder="Expected Post Retirement Return"
                              onChange={(event) => {
                                setFieldValue(
                                  (values.expectedPostRetirementReturn =
                                    event.target.value)
                                );

                                //#region retirementCalculation

                                var NoOfYearsLeftForRetirementValues =
                                  values.retirementAge - values.currentAge;
                                var YearsAfterRetirementValues =
                                  values.lifeExpectancy - values.retirementAge;

                                var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                  values.currentHouseAndLifeStyleExpenses,
                                  values.inflationRateValuesRetirement,
                                  NoOfYearsLeftForRetirementValues
                                );

                                var FirstYearExpenseAfterRetirementPostDetails =
                                  Number(
                                    FirstMonthExpenseAfterRetirementDetails
                                  ) * 12;

                                var FirstYearExpenseAfterRetirementPre =
                                  FirstYearExpenseAfterRetirementPostDetails /
                                  (1 - 0.2);

                                var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                  values.expectedPostRetirementReturn,
                                  values.inflationRateValuesRetirement
                                );

                                var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                  RateOtherhideCalculation,
                                  YearsAfterRetirementValues,
                                  FirstYearExpenseAfterRetirementPre
                                );

                                var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                  values.expectedPreRetirementReturn,
                                  YearsAfterRetirementValues,
                                  RetirementCorpusRequiredDetails
                                );

                                var TotalCorpusRequiredDetails =
                                  RetirementCorpusRequiredDetails +
                                  FundYouMustDetails;

                                var assetallocatedvalueDetails = 0;
                                {
                                  (values.assetAllocation || []).map(
                                    (assetAllocationDetail) =>
                                      (assetallocatedvalueDetails +=
                                        assetAllocationDetail.assetfuturevalue)
                                  );
                                }

                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                  Number(assetallocatedvalueDetails),
                                  0,
                                  1
                                );
                                if (
                                  Number(TotalCorpusRequiredDetails) <
                                  Number(AssetMappedValueData)
                                ) {
                                  warning(
                                    "Asset mapped values should not be greater than total retirement corpus...!",
                                    warningNotification
                                  );
                                  return;
                                }
                                //end asset mapped values
                                var deficitValueData =
                                  Number(TotalCorpusRequiredDetails) -
                                  Number(AssetMappedValueData);
                                // RetirementCorpusRequiredDetails +
                                // FundYouMustDetails;

                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                  AssetMappedValueData,
                                  TotalCorpusRequiredDetails
                                );

                                var lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                  values.expectedPreRetirementReturn,
                                  NoOfYearsLeftForRetirementValues,
                                  deficitValueData
                                );

                                var SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                  values.expectedPreRetirementReturn,
                                  NoOfYearsLeftForRetirementValues,
                                  deficitValueData
                                );

                                //#endregion

                                setFieldValue(
                                  (values.retirementYear =
                                    values.goalStartYear +
                                    NoOfYearsLeftForRetirementValues),
                                  (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                  (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                  (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                    0
                                  )),
                                  (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                    0
                                  )),
                                  (values.FundYouMust = FundYouMustDetails.toFixed(
                                    0
                                  )),
                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                    0
                                  )),
                                  (values.goalAchievementScaleValues = [
                                    GoalAchievementScaleData.toFixed(0),
                                  ]),
                                  (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                    0
                                  )),
                                  (values.deficitValue = deficitValueData.toFixed(
                                    0
                                  )),
                                  (values.lumSumValue = lumSumValueData.toFixed(
                                    0
                                  )),
                                  (values.sipValue = SIPValueData.toFixed(0))
                                );
                              }}
                            />
                            <div className="clearfix"></div>
                          </div>
                        </div>

                        <div className="col-sm-12 col-md-4 rate-prog-box-one smallwidth pl pr">
                          <div className="form-group">
                            <label>Expected Pre Retirement Return (%)</label>
                            <Field
                              type="number"
                              name="expectedPreRetirementReturn"
                              id="expectedPreRetirementReturn"
                              min="1"
                              max="100"
                              className={
                                "form-control mod-input" +
                                (errors.expectedPreRetirementReturn &&
                                touched.expectedPreRetirementReturn
                                  ? " is-invalid"
                                  : "")
                              }
                              placeholder="Expected Pre Retirement Return"
                              onChange={(event) => {
                                setFieldValue(
                                  (values.expectedPreRetirementReturn =
                                    event.target.value)
                                );
                                //#region retirementCalculation

                                var NoOfYearsLeftForRetirementValues =
                                  values.retirementAge - values.currentAge;
                                var YearsAfterRetirementValues =
                                  values.lifeExpectancy - values.retirementAge;

                                var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                  values.currentHouseAndLifeStyleExpenses,
                                  values.inflationRateValuesRetirement,
                                  NoOfYearsLeftForRetirementValues
                                );

                                var FirstYearExpenseAfterRetirementPostDetails =
                                  Number(
                                    FirstMonthExpenseAfterRetirementDetails
                                  ) * 12;

                                var FirstYearExpenseAfterRetirementPre =
                                  FirstYearExpenseAfterRetirementPostDetails /
                                  (1 - 0.2);

                                var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                  values.expectedPostRetirementReturn,
                                  values.inflationRateValuesRetirement
                                );

                                var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                  RateOtherhideCalculation,
                                  YearsAfterRetirementValues,
                                  FirstYearExpenseAfterRetirementPre
                                );

                                var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                  values.expectedPreRetirementReturn,
                                  YearsAfterRetirementValues,
                                  RetirementCorpusRequiredDetails
                                );

                                var TotalCorpusRequiredDetails =
                                  RetirementCorpusRequiredDetails +
                                  FundYouMustDetails;

                                var assetallocatedvalueDetails = 0;
                                {
                                  (values.assetAllocation || []).map(
                                    (assetAllocationDetail) =>
                                      (assetallocatedvalueDetails +=
                                        assetAllocationDetail.assetfuturevalue)
                                  );
                                }

                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                  Number(assetallocatedvalueDetails),
                                  0,
                                  1
                                );
                                if (
                                  Number(TotalCorpusRequiredDetails) <
                                  Number(AssetMappedValueData)
                                ) {
                                  warning(
                                    "Asset mapped values should not be greater than total retirement corpus...!",
                                    warningNotification
                                  );
                                  return;
                                }
                                //end asset mapped values
                                var deficitValueData =
                                  Number(TotalCorpusRequiredDetails) -
                                  Number(AssetMappedValueData);
                                // RetirementCorpusRequiredDetails +
                                // FundYouMustDetails;

                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                  AssetMappedValueData,
                                  TotalCorpusRequiredDetails
                                );

                                var lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                  values.expectedPreRetirementReturn,
                                  NoOfYearsLeftForRetirementValues,
                                  deficitValueData
                                );

                                var SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                  values.expectedPreRetirementReturn,
                                  NoOfYearsLeftForRetirementValues,
                                  deficitValueData
                                );

                                //#endregion

                                setFieldValue(
                                  (values.retirementYear =
                                    values.goalStartYear +
                                    NoOfYearsLeftForRetirementValues),
                                  (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                  (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                  (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                    0
                                  )),
                                  (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                    0
                                  )),
                                  (values.FundYouMust = FundYouMustDetails.toFixed(
                                    0
                                  )),
                                  (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                    0
                                  )),
                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                    0
                                  )),
                                  (values.goalAchievementScaleValues = [
                                    GoalAchievementScaleData.toFixed(0),
                                  ]),
                                  (values.deficitValue = deficitValueData.toFixed(
                                    0
                                  )),
                                  (values.lumSumValue = lumSumValueData.toFixed(
                                    0
                                  )),
                                  (values.sipValue = SIPValueData.toFixed(0))
                                );
                              }}
                            />
                            <div className="clearfix"></div>
                          </div>
                        </div>

                        <div className="clearfix"></div>
                      </div>
                    ) : null}

                    <div className="col-sm-12 col-md-12 pl pr">
                      <div className="value-box">
                        <div className="total-value left-margin">
                          <div className="all-count-label-3">
                            {!values.retirement ? (
                              <span> Target Value</span>
                            ) : null}
                            {values.retirement ? (
                              <span> Total Retirement Corpus Required</span>
                            ) : null}
                          </div>
                          <div
                            className="all-count"
                            title={(values.targetValue || 0)
                              .toString()
                              .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                          >
                            <span>
                              <CurrencyValue
                                state={values.targetValue || 0}
                              ></CurrencyValue>
                            </span>
                          </div>
                        </div>

                        <div className="total-value">
                          <div className="all-count-label-3">
                            Asset Future Value
                          </div>
                          <div
                            className="all-count"
                            title={(values.assetMappedValue || 0)
                              .toString()
                              .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                          >
                            <CurrencyValue
                              state={values.assetMappedValue || 0}
                            ></CurrencyValue>
                          </div>
                        </div>

                        <div className="total-value">
                          <div className="all-count-label-3">Deficit Value</div>
                          <div
                            className="all-count"
                            title={(values.deficitValue || 0)
                              .toString()
                              .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                          >
                            <CurrencyValue
                              state={values.deficitValue || 0}
                            ></CurrencyValue>
                          </div>
                        </div>

                        <div className="total-value">
                          <div className="all-count-label">
                            Additional Investment Required{" "}
                            <span className="red-text">SIP</span>
                          </div>
                          <div
                            className="all-count-red"
                            title={(values.sipValue === "Infinity"
                              ? 0
                              : values.sipValue || 0
                            )
                              .toString()
                              .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                          >
                            <span>
                              {/* {" "}
                              {(values.sipValue === "Infinity"
                                ? 0
                                : values.sipValue || 0
                              )
                                .toString()
                                .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}{" "} */}
                            </span>
                            <CurrencyValue
                              state={
                                values.sipValue === "Infinity"
                                  ? 0
                                  : values.sipValue || 0
                              }
                            ></CurrencyValue>

                            {/* {values.sipValue} */}
                          </div>
                        </div>

                        <div className="total-value">
                          <div className="all-count-label">
                            Additional Investment Required{" "}
                            <span className="red-text">LUMPSUM</span>
                          </div>
                          <div
                            className="all-count-red"
                            title={(values.lumSumValue || 0)
                              .toString()
                              .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}
                          >
                            <CurrencyValue
                              state={values.lumSumValue || 0}
                            ></CurrencyValue>
                          </div>
                        </div>

                        <div className="clearfix"></div>
                      </div>
                    </div>
                    <div className="clearfix"></div>
                    <div className="border"></div>
                    <div className="goal-sub-title">
                      Asset Allocation{" "}
                      {values.AssetAllocationAddNewRow ? (
                        <span
                          className="btn-8 ml-5 mr-5 mt-10 addAsset"
                          onClick={(event) => {
                            setFieldValue(
                              (values.assetAllocation = [
                                {
                                  goalassetallocationid: "",
                                  partyassetid: "",
                                  assetcurrentvalue: "",
                                  assetallocatedvalue: "",
                                  assetremainingvalue: "",
                                  mappedpercentage: "",
                                  assetallocationpercentage: "",
                                },
                              ]),
                              (values.AssetAllocationAddNewRow = false)
                            );
                          }}
                        >
                          {" "}
                          <i className="fa fa-plus" aria-hidden="true"></i> Add
                          Asset{" "}
                        </span>
                      ) : null}
                    </div>

                    <div className="asset-allocation">
                      <FieldArray
                        name="assetAllocation"
                        render={(arrayHelpers) => (
                          <div>
                            <div className="table-row">
                              <table
                                className="table table-bordered table-hover"
                                id="tab_logic"
                              >
                                <thead>
                                  <tr>
                                    <th className="text-center">
                                      <label>Asset Name</label>
                                    </th>
                                   
                                    <th className="text-center">
                                      <label>Asset Current Value (INR)</label>
                                    </th>
                                    <th className="text-center">
                                      <label>Growth Rate</label>
                                    </th>
                                    <th className="text-center">
                                      <label>Asset Remaining Value (INR)</label>
                                    </th>
                                    <th className="text-center">
                                      <label>Allocation Type</label>
                                    </th>
                                    <th className="text-center">
                                      <label>Mapped(%)</label>
                                    </th>
                                    <th className="text-center">
                                      <label>Asset Allocated Value (INR)</label>
                                    </th>
                                    <th className="text-center">
                                      <label>Asset Future Value (INR)</label>
                                    </th>
                                    <th className="text-center">
                                      <label>Action</label>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(values.assetAllocation || []).map(
                                    (friend, index) => (
                                      <tr key={index}>
                                        <td>
                                          <Field
                                            as="select"
                                            name={`assetAllocation.${index}.partyassetid`}
                                            id={`assetAllocation.${index}.partyassetid`}
                                            className="form-control"
                                            value={friend.partyassetid}
                                            onChange={(event) => {
                                              //var Assetdata=Object.va
                                             
                                              const partyassetidDetail =
                                                event.target.value;
                                              if (
                                                Object.values(
                                                  values.assetAllocation
                                                ).filter(
                                                  (x) =>
                                                    Number(x.partyassetid) ===
                                                    Number(partyassetidDetail)
                                                ).length > 0
                                              ) {
                                                warning(
                                                  "Asset name already maapped...!",
                                                  warningNotification
                                                );
                                                return;
                                              }

                                              const assetcurrentvalueDetail = event.target.options[
                                                event.target.options
                                                  .selectedIndex
                                              ].getAttribute("data-key");

                                              const descriptionDetail =
                                                event.target.options[
                                                  event.target.options
                                                    .selectedIndex
                                                ].text;

                                              setFieldValue(
                                                (friend.partyassetid = partyassetidDetail),
                                                (friend.assetcurrentvalue = assetcurrentvalueDetail),
                                                (friend.description = descriptionDetail),
                                                (friend.mappedpercentage = ""),
                                                (friend.assetallocatedvalue =
                                                  "")
                                              );

                                              const userId = this.props.user
                                                .user.userId;

                                              // assetAllocationService.getRemainingValue(
                                              //   partyassetidDetail,
                                              //   assetcurrentvalueDetail,
                                              //   userId,
                                              //   (res) => {
                                              //     if (
                                              //       res["data"].status ===
                                              //       "success"
                                              //     ) {
                                              //       if (
                                              //         Number(
                                              //           res["data"]
                                              //             .responseObject
                                              //             .assetremainingvalue
                                              //         ) === 0
                                              //       ) {
                                              //         setFieldValue(
                                              //           (friend.assetremainingvalue = 0)
                                              //         );
                                              //       } else {
                                              //         setFieldValue(
                                              //           (friend.assetremainingvalue =
                                              //             res[
                                              //               "data"
                                              //             ].responseObject.assetremainingvalue)
                                              //         );
                                              //       }
                                              //     }
                                              //   }
                                              // );

                                              assetAllocationService.getAssetDetailValue(
                                                partyassetidDetail,
                                                assetcurrentvalueDetail,
                                                userId,
                                                (res) => {
                                                  if (
                                                    res["data"].status ===
                                                    "success"
                                                  ) {
                                                    var growthrate = res.data.responseObject.growthRate;
                                                    assetAllocationService.getRemainingValue(
                                                      partyassetidDetail,
                                                      assetcurrentvalueDetail,
                                                      userId,
                                                      (res) => {
                                                        if (
                                                          res["data"].status ===
                                                          "success"
                                                        ) {
                                                          if (
                                                            Number(
                                                              res["data"]
                                                                .responseObject
                                                                .assetremainingvalue
                                                            ) === 0
                                                          ) {
                                                            setFieldValue(
                                                              (friend.assetremainingvalue = 0),
                                                              (friend.assetgrowthrate = 0)
                                                            );
                                                          } else {
                                                            setFieldValue(
                                                              (friend.assetremainingvalue =
                                                                res[
                                                                  "data"
                                                                ].responseObject.assetremainingvalue),
                                                                (friend.assetgrowthrate = growthrate)
                                                            );
                                                          }
                                                        }
                                                      }
                                                    );
                                                  }
                                                }
                                                );    
                                            }}
                                          >
                                            <option value="">
                                              Select Asset
                                            </option>
                                            {(this.props.assetList || []).map(
                                              (team) => (
                                                <option
                                                  key={team.partyAssetId}
                                                  data-key={team.currentvalue}
                                                  value={JSON.stringify(
                                                    team.partyAssetId
                                                  )}
                                                >
                                                  {team.description}
                                                </option>
                                              )
                                            )}
                                          </Field>
                                          {errors &&
                                            errors.assetAllocation &&
                                            errors.assetAllocation[index] &&
                                            errors.assetAllocation[index]
                                              .partyassetid &&
                                            touched &&
                                            touched.assetAllocation &&
                                            touched.assetAllocation[index] &&
                                            touched.assetAllocation[index]
                                              .partyassetid && (
                                              <div className="text-danger">
                                                {
                                                  errors.assetAllocation[index]
                                                    .partyassetid
                                                }
                                              </div>
                                            )}
                                        </td>

                                        <td>
                                          <Field
                                            name={`assetAllocation.${index}.assetcurrentvalue`}
                                            className="form-control"
                                            value={friend.assetcurrentvalue}
                                            placeholder="Asset Current Value (INR)"
                                            disabled
                                          />

                                          {errors &&
                                            errors.assetAllocation &&
                                            errors.assetAllocation[index] &&
                                            errors.assetAllocation[index]
                                              .assetcurrentvalue &&
                                            touched &&
                                            touched.assetAllocation &&
                                            touched.assetAllocation[index] &&
                                            touched.assetAllocation[index]
                                              .assetcurrentvalue && (
                                              <div className="text-danger">
                                                {
                                                  errors.assetAllocation[index]
                                                    .assetcurrentvalue
                                                }
                                              </div>
                                            )}
                                          <span className="currency-word">
                                            <CurrencyWordFormat
                                              state={friend.assetcurrentvalue}
                                            ></CurrencyWordFormat>
                                          </span>
                                        </td>

                                        <td>
                                          <Field
                                            name={`assetAllocation.${index}.assetgrowthrate`}
                                            className="form-control"
                                            placeholder="Growth Rate"
                                            disabled
                                          />                                         
                                        </td>

                                        <td>
                                          <Field
                                            name={`assetAllocation.${index}.assetremainingvalue`}
                                            className="form-control"
                                            value={friend.assetremainingvalue}
                                            placeholder="Asset Remaining Value (INR)"
                                            disabled
                                          />

                                          {errors &&
                                            errors.assetAllocation &&
                                            errors.assetAllocation[index] &&
                                            errors.assetAllocation[index]
                                              .assetremainingvalue &&
                                            touched &&
                                            touched.assetAllocation &&
                                            touched.assetAllocation[index] &&
                                            touched.assetAllocation[index]
                                              .assetremainingvalue && (
                                              <div className="text-danger">
                                                {
                                                  errors.assetAllocation[index]
                                                    .assetremainingvalue
                                                }
                                              </div>
                                            )}
                                          <span className="currency-word">
                                            <CurrencyWordFormat
                                              state={friend.assetremainingvalue}
                                            ></CurrencyWordFormat>
                                          </span>
                                        </td>

                                        <td>
                                          <Field
                                            as="select"
                                            defaultValue="Percentage"
                                            name={`allocationtype.${index}.mapped`}
                                            id="allocationtype"
                                            className="form-control"
                                            placeholder="Allocation type"
                                            onChange={(event) => {
                                              let percentinput =
                                                "assetAllocation." +
                                                index +
                                                ".mappedpercentage";
                                              let fixinput =
                                                "assetAllocation." +
                                                index +
                                                ".assetallocatedvalue";
                                              console.log(percentinput);
                                              console.log(fixinput);
                                              if (
                                                event.target.value ==
                                                "Percentage"
                                              ) {
                                                console.log("here");
                                                $(
                                                  "input[name='" +
                                                    percentinput +
                                                    "']"
                                                ).removeAttr("disabled");
                                                $(
                                                  "input[name='" +
                                                    fixinput +
                                                    "']"
                                                ).attr("disabled", "disabled");
                                              } else {
                                                console.log("here 111");
                                                $(
                                                  "input[name='" +
                                                    percentinput +
                                                    "']"
                                                ).attr("disabled", "disabled");
                                                $(
                                                  "input[name='" +
                                                    fixinput +
                                                    "']"
                                                ).removeAttr("disabled");
                                                // $("input[name='" + percentinput + "']").removeAttr('disabled');
                                                // $("input[name='" + fixinput + "']").attr('disabled', 'disabled');
                                              }
                                            }}
                                          >
                                            <option value="Percentage">
                                              Percentage
                                            </option>
                                            <option value="Fixed Amount">
                                              Fixed Amount
                                            </option>
                                          </Field>
                                        </td>

                                        <td className="percentalloc">
                                          <Field
                                            type="number"
                                            name={`assetAllocation.${index}.mappedpercentage`}
                                            //onChange={handleChange}
                                            className="form-control percentalloc"
                                            min="0"
                                            max="100"
                                            placeholder="Mapped(%)"
                                            value={friend.mappedpercentage}
                                            onChange={(event) => {
                                              const CurrenAssetcurrentvalue =
                                                event.target.value;
                                              debugger;
                                              if (!values.retirement) {
                                               
                                                var yearGap =
                                                  Number(values.goalYear) -
                                                  Number(values.goalStartYear);
                                                setFieldValue(
                                                  (values.yearGap = "")
                                                );
                                                setFieldValue(
                                                  // (values.targetValue = 0),
                                                  // (values.deficitValue = 0),
                                                  // (values.goalAchievementScaleValues = [
                                                  //   0,
                                                  // ]),
                                                  // (values.lumSumValue = 0),
                                                  // (values.sipValue = 0),
                                                  (values.yearGap = yearGap)
                                                );

												
												  
                                                var targetValueData = GoalCalculation.TargetValue(
                                                  values.currentValue,
                                                  values.inflationRateValues,
                                                  values.yearGap
                                                );

                                                var assetallocatedvalue =
                                                  (Number(
                                                    friend.assetcurrentvalue
                                                  ) *
                                                    Number(
                                                      CurrenAssetcurrentvalue
                                                    )) /
                                                  100;
												
												                          var AssetFutureValueData = GoalCalculation.AssetMappedValue(
                                                    Number(assetallocatedvalue),
                                                    friend.assetgrowthrate,
                                                    values.yearGap
                                                  );	
                                                setFieldValue(
                                                  (friend.assetallocatedvalue = assetallocatedvalue),
                                                  (friend.mappedpercentage = CurrenAssetcurrentvalue),
												                          (friend.assetfuturevalue = AssetFutureValueData.toFixed(
                                                    0
                                                  ))
                                                );

                                                var assetallocatedvalueDetails = 0;
                                                {
                                                  (
                                                    values.assetAllocation || []
                                                  ).map(
                                                    (assetAllocationDetail) =>
                                                      (assetallocatedvalueDetails +=
                                                        Number(assetAllocationDetail.assetfuturevalue)
                                                  ));
                                                }

                                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                                  assetallocatedvalueDetails,
                                                  0,
                                                  1
                                                );

                                                if (
                                                  Number(targetValueData) <
                                                  Number(AssetMappedValueData)
                                                ) {
                                                  setFieldValue(
                                                    (friend.assetallocatedvalue = ""),
                                                    (friend.mappedpercentage = ""),
													 (friend.assetfuturevalue = "")
                                                  );
                                                  warning(
                                                    "Asset mapped values should not be greater than target value...!",
                                                    warningNotification
                                                  );
                                                  var rowCount = $('#tab_logic tr').length;
                                                  console.log('assetAllocation."+(rowCount-1)+".mappedpercentage')
                                                  console.log('assetAllocation."+(rowCount-1)+".assetallocatedvalue')
                                                  $("input[name='assetAllocation."+(rowCount-1)+".mappedpercentage']").val(0);
                                                  $("input[name='assetAllocation."+(rowCount-1)+".assetallocatedvalue']").val(0);
                                                  
                                                  return;
                                                }

                                                if (
                                                  Number(
                                                    friend.assetremainingvalue
                                                  ) <
                                                  Number(
                                                    friend.assetallocatedvalue
                                                  )
                                                ) {
                                                  setFieldValue(
                                                    (friend.assetallocatedvalue = ""),
                                                    (friend.mappedpercentage = ""),
													 (friend.assetfuturevalue = "")
                                                  );
                                                  warning(
                                                    "Asset allocated values should not be greater than asset remaining value...!",
                                                    warningNotification
                                                  );
                                                  var rowCount = $('#tab_logic tr').length;
                                                  console.log('assetAllocation."+(rowCount-1)+".mappedpercentage')
                                                  console.log('assetAllocation."+(rowCount-1)+".assetallocatedvalue')
                                                  $("input[name='assetAllocation."+(rowCount-1)+".mappedpercentage']").val(0);
                                                  $("input[name='assetAllocation."+(rowCount-1)+".assetallocatedvalue']").val(0);
                                                  
                                                  return;
                                                }

												
                                                var deficitValueData =
                                                  targetValueData -
                                                  Number(AssetMappedValueData);

                                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                                  AssetMappedValueData,
                                                  targetValueData
                                                );

                                                var lumSumValueData = GoalCalculation.lumSumValueData(
                                                  deficitValueData,
                                                  values.growthRateValues,
                                                  values.yearGap
                                                );

                                                var SIPValueData = GoalCalculation.SIPValueData(
                                                  deficitValueData,
                                                  values.growthRateValues,
                                                  values.yearGap
                                                );

                                                setFieldValue(
                                                  (values.currentValue =
                                                    values.currentValue),
                                                  (values.targetValue = targetValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.deficitValue = deficitValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.goalAchievementScaleValues = [
                                                    GoalAchievementScaleData.toFixed(
                                                      0
                                                    ),
                                                  ]),
                                                  (values.lumSumValue = lumSumValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.sipValue =
                                                    SIPValueData === "Infinity"
                                                      ? 0
                                                      : SIPValueData.toFixed(0))
                                                );
                                              } else {
                                                //#region retirementCalculation
                                                debugger;
                                                var NoOfYearsLeftForRetirementValues =
                                                  values.retirementAge -
                                                  values.currentAge;
                                                var YearsAfterRetirementValues =
                                                  values.lifeExpectancy -
                                                  values.retirementAge;

                                                var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                                  values.currentHouseAndLifeStyleExpenses,
                                                  values.inflationRateValuesRetirement,
                                                  NoOfYearsLeftForRetirementValues
                                                );

                                                var FirstYearExpenseAfterRetirementPostDetails =
                                                  Number(
                                                    FirstMonthExpenseAfterRetirementDetails
                                                  ) * 12;

                                                var FirstYearExpenseAfterRetirementPre =
                                                  FirstYearExpenseAfterRetirementPostDetails /
                                                  (1 - 0.2);

                                                var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                                  values.expectedPostRetirementReturn,
                                                  values.inflationRateValuesRetirement
                                                );

                                                var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                                  RateOtherhideCalculation,
                                                  YearsAfterRetirementValues,
                                                  FirstYearExpenseAfterRetirementPre
                                                );

                                                var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                                  values.expectedPreRetirementReturn,
                                                  YearsAfterRetirementValues,
                                                  RetirementCorpusRequiredDetails
                                                );

                                                var TotalCorpusRequiredDetails =
                                                  RetirementCorpusRequiredDetails +
                                                  FundYouMustDetails;

                                                // Asset mapped values
                                                const CurrenAssetcurrentvalue =
                                                  event.target.value;
                                               
                                                var assetallocatedvalue =
                                                  (Number(
                                                    friend.assetcurrentvalue
                                                  ) *
                                                    Number(
                                                      CurrenAssetcurrentvalue
                                                    )) /
                                                  100;
												
												
												//  var AssetFutureValueData = GoalCalculation.AssetMappedValue(
                        //                           Number(assetallocatedvalue),
                        //                           values.inflationRateValues,
                        //                           values.yearGap
                        //                         );

                                            var AssetFutureValueData = GoalCalculation.AssetMappedValue(
                                              Number(assetallocatedvalue),
                                              friend.assetgrowthrate,
                                              NoOfYearsLeftForRetirementValues
                                            );
                                                setFieldValue(
                                                  (friend.mappedpercentage = "")
                                                );
                                                setFieldValue(
                                                  (friend.assetallocatedvalue = assetallocatedvalue),
                                                  (friend.mappedpercentage = CurrenAssetcurrentvalue),
												                        (friend.assetfuturevalue = AssetFutureValueData.toFixed(
                                                    0
                                                  ))
                                                );

                                                var assetallocatedvalueDetails = 0;
                                                {
                                                  (
                                                    values.assetAllocation || []
                                                  ).map(
                                                    (assetAllocationDetail) =>
                                                      (assetallocatedvalueDetails +=
                                                        Number(assetAllocationDetail.assetfuturevalue))
                                                  );
                                                }

                                                // var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                                //   assetallocatedvalueDetails,
                                                //   values.inflationRateValuesRetirement,
                                                //   NoOfYearsLeftForRetirementValues
                                                // );
                                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                                  assetallocatedvalueDetails,
                                                  0,
                                                  1
                                                );
                                                if (
                                                  Number(
                                                    TotalCorpusRequiredDetails
                                                  ) <
                                                  Number(AssetMappedValueData)
                                                ) {

                                                  setFieldValue(
                                                    (friend.mappedpercentage = ""),
                                                    (friend.assetallocatedvalue = ""),
                                                    (friend.assetfuturevalue = "")
                                                  )    
                                                  warning(
                                                    "Asset mapped values should not be greater than total retirement corpus...!",
                                                    warningNotification
                                                  );
                                                  var rowCount = $('#tab_logic tr').length;
                                                  console.log('assetAllocation."+(rowCount-1)+".mappedpercentage')
                                                  console.log('assetAllocation."+(rowCount-1)+".assetallocatedvalue')
                                                  $("input[name='assetAllocation."+(rowCount-1)+".mappedpercentage']").val(0);
                                                  $("input[name='assetAllocation."+(rowCount-1)+".assetallocatedvalue']").val(0);
                                                    
                                                  return;
                                                }

                                                if (
                                                  Number(
                                                    friend.assetremainingvalue
                                                  ) <
                                                  Number(
                                                    friend.assetallocatedvalue
                                                  )
                                                ) {
                                                  setFieldValue(
                                                    (friend.mappedpercentage = ""),
                                                    (friend.assetallocatedvalue = "")
                                                  );
                                                  warning(
                                                    "Asset allocated values should not be greater than asset remaining value...!",
                                                    warningNotification
                                                  );

                                                  // var rowCount = $('#tab_logic tr').length;
                                                  // console.log('assetAllocation."+(rowCount-1)+".mappedpercentage')
                                                  // console.log('assetAllocation."+(rowCount-1)+".assetallocatedvalue')
                                                  // $("input[name='assetAllocation."+(rowCount-1)+".mappedpercentage']").val(0);
                                                  // $("input[name='assetAllocation."+(rowCount-1)+".assetallocatedvalue']").val(0);
                                                    
                                                  return;
                                                }
                                                //end asset mapped values

                                                var deficitValueData =
                                                  Number(
                                                    TotalCorpusRequiredDetails
                                                  ) -
                                                  Number(AssetMappedValueData);
                                                // RetirementCorpusRequiredDetails +
                                                // FundYouMustDetails;

                                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                                  AssetMappedValueData,
                                                  TotalCorpusRequiredDetails
                                                );

                                                lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                                  values.expectedPreRetirementReturn,
                                                  NoOfYearsLeftForRetirementValues,
                                                  deficitValueData
                                                );

                                                SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                                  values.expectedPreRetirementReturn,
                                                  NoOfYearsLeftForRetirementValues,
                                                  deficitValueData
                                                );

                                                setFieldValue(
                                                  (values.retirementYear =
                                                    values.goalStartYear +
                                                    NoOfYearsLeftForRetirementValues),
                                                  (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                                  (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                                  (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                                    0
                                                  )),
                                                  (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                                    0
                                                  )),
                                                  (values.FundYouMust = FundYouMustDetails.toFixed(
                                                    0
                                                  )),
                                                  (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                                    0
                                                  )),
                                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.goalAchievementScaleValues = [
                                                    GoalAchievementScaleData.toFixed(
                                                      0
                                                    ),
                                                  ]),
                                                  (values.deficitValue = deficitValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.lumSumValue = lumSumValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.sipValue = SIPValueData.toFixed(
                                                    0
                                                  ))
                                                );

                                                //#endregion
                                              }
                                            }}
                                          />
                                          {errors &&
                                            errors.assetAllocation &&
                                            errors.assetAllocation[index] &&
                                            errors.assetAllocation[index]
                                              .mappedpercentage &&
                                            touched &&
                                            touched.assetAllocation &&
                                            touched.assetAllocation[index] &&
                                            touched.assetAllocation[index]
                                              .mappedpercentage && (
                                              <div className="text-danger">
                                                {
                                                  errors.assetAllocation[index]
                                                    .mappedpercentage
                                                }
                                              </div>
                                            )}
                                        </td>
                                        <td className="fixedalloc">
                                          <Field
                                            type="number"
                                            name={`assetAllocation.${index}.assetallocatedvalue`}
                                            className="form-control fixedalloc"
                                            value={friend.assetallocatedvalue}
                                            placeholder="Asset Allocated Value (INR)"
                                            disabled
                                            onChange={(event) => {
                                              const CurrenAssetcurrentvalue =
                                                event.target.value;

                                              if (!values.retirement) {
                                                window.focus();
                                                var yearGap =
                                                  Number(values.goalYear) -
                                                  Number(values.goalStartYear);
                                                setFieldValue(
                                                  (values.yearGap = "")
                                                );
                                                setFieldValue(
                                                  // (values.targetValue = 0),
                                                  // (values.deficitValue = 0),
                                                  // (values.goalAchievementScaleValues = [
                                                  //   0,
                                                  // ]),
                                                  // (values.lumSumValue = 0),
                                                  // (values.sipValue = 0),
                                                  (values.yearGap = yearGap)
                                                );

                                                var targetValueData = GoalCalculation.TargetValue(
                                                  values.currentValue,
                                                  values.inflationRateValues,
                                                  values.yearGap
                                                );

                                                var assetallocatedvalue =
                                                  (100 *
                                                    Number(
                                                      CurrenAssetcurrentvalue
                                                    )) /
                                                  friend.assetcurrentvalue;

                                                  var AssetFutureValueData = GoalCalculation.AssetMappedValue(
                                                    Number(CurrenAssetcurrentvalue),
                                                    values.inflationRateValues,
                                                    values.yearGap
                                                  );

                                                  
                                                setFieldValue(
                                                  (friend.assetallocatedvalue = 0)
                                                );
                                                setFieldValue(
                                                  (friend.assetallocatedvalue = Number(
                                                    CurrenAssetcurrentvalue
                                                  )),
                                                  (friend.mappedpercentage = assetallocatedvalue.toFixed(
                                                    0
                                                  )),
                                                  (friend.assetfuturevalue = AssetFutureValueData.toFixed(
                                                    0
                                                  ))
                                                );

                                                var assetallocatedvalueDetails = 0;
                                                {
                                                  (
                                                    values.assetAllocation || []
                                                  ).map(
                                                    (assetAllocationDetail) =>
                                                      (assetallocatedvalueDetails +=
                                                        Number(assetAllocationDetail.assetallocatedvalue))
                                                  );
                                                }

                                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                                  assetallocatedvalueDetails,
                                                  values.inflationRateValues,
                                                  values.yearGap
                                                );

                                               
                                                if (
                                                  Number(targetValueData) <
                                                  Number(AssetMappedValueData)
                                                ) {
                                                  setFieldValue(
                                                    (friend.assetallocatedvalue = ""),
                                                    (friend.mappedpercentage = ""),
                                                    (friend.assetfuturevalue = "")
                                                  );
                                                  warning(
                                                    "Asset mapped values should not be greater than target value...!",
                                                    warningNotification
                                                  );
                                                  var rowCount = $('#tab_logic tr').length;
                                                  console.log('assetAllocation."+(rowCount-1)+".mappedpercentage')
                                                  console.log('assetAllocation."+(rowCount-1)+".assetallocatedvalue')
                                                  $("input[name='assetAllocation."+(rowCount-1)+".mappedpercentage']").val(0);
                                                  $("input[name='assetAllocation."+(rowCount-1)+".assetallocatedvalue']").val(0);
                                                  $("input[name='assetAllocation."+(rowCount-1)+".assetfuturevalue']").val(0);
                                                  
                                                  return;
                                                }

                                                if (
                                                  Number(
                                                    friend.assetremainingvalue
                                                  ) <
                                                  Number(
                                                    friend.assetallocatedvalue
                                                  )
                                                ) {
                                                  setFieldValue(
                                                    (friend.assetallocatedvalue = ""),
                                                    (friend.mappedpercentage = ""),
                                                    (friend.assetfuturevalue = "")
                                                  );
                                                  warning(
                                                    "Asset allocated values should not be greater than asset remaining value...!",
                                                    warningNotification
                                                  );
                                                  var rowCount = $('#tab_logic tr').length;
                                                  console.log('assetAllocation."+(rowCount-1)+".mappedpercentage')
                                                  console.log('assetAllocation."+(rowCount-1)+".assetallocatedvalue')
                                                  $("input[name='assetAllocation."+(rowCount-1)+".mappedpercentage']").val(0);
                                                  $("input[name='assetAllocation."+(rowCount-1)+".assetallocatedvalue']").val(0);
                                                  $("input[name='assetAllocation."+(rowCount-1)+".assetfuturevalue']").val(0);
                                                  
                                                  return;
                                                }

                                                var AssetFutureValueData = GoalCalculation.AssetMappedValue(
                                                  Number(CurrenAssetcurrentvalue),
                                                  values.inflationRateValues,
                                                  values.yearGap
                                                );

                                                var deficitValueData =
                                                  targetValueData -
                                                  Number(AssetMappedValueData);

                                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                                  AssetMappedValueData,
                                                  targetValueData
                                                );

                                                var lumSumValueData = GoalCalculation.lumSumValueData(
                                                  deficitValueData,
                                                  values.growthRateValues,
                                                  values.yearGap
                                                );

                                                var SIPValueData = GoalCalculation.SIPValueData(
                                                  deficitValueData,
                                                  values.growthRateValues,
                                                  values.yearGap
                                                );

                                                setFieldValue(
                                                  (values.currentValue =
                                                    values.currentValue),
                                                  (values.targetValue = targetValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.deficitValue = deficitValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.goalAchievementScaleValues = [
                                                    GoalAchievementScaleData.toFixed(
                                                      0
                                                    ),
                                                  ]),
                                                  (values.lumSumValue = lumSumValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.sipValue =
                                                    SIPValueData === "Infinity"
                                                      ? 0
                                                      : SIPValueData.toFixed(0))
                                                );
                                              } else {
                                                //#region retirementCalculation
debugger;
                                                var NoOfYearsLeftForRetirementValues =
                                                  values.retirementAge -
                                                  values.currentAge;
                                                var YearsAfterRetirementValues =
                                                  values.lifeExpectancy -
                                                  values.retirementAge;

                                                var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                                  values.currentHouseAndLifeStyleExpenses,
                                                  values.inflationRateValuesRetirement,
                                                  NoOfYearsLeftForRetirementValues
                                                );

                                                var FirstYearExpenseAfterRetirementPostDetails =
                                                  Number(
                                                    FirstMonthExpenseAfterRetirementDetails
                                                  ) * 12;

                                                var FirstYearExpenseAfterRetirementPre =
                                                  FirstYearExpenseAfterRetirementPostDetails /
                                                  (1 - 0.2);

                                                var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                                  values.expectedPostRetirementReturn,
                                                  values.inflationRateValuesRetirement
                                                );

                                                var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                                  RateOtherhideCalculation,
                                                  YearsAfterRetirementValues,
                                                  FirstYearExpenseAfterRetirementPre
                                                );

                                                var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                                  values.expectedPreRetirementReturn,
                                                  YearsAfterRetirementValues,
                                                  RetirementCorpusRequiredDetails
                                                );

                                                var TotalCorpusRequiredDetails =
                                                  RetirementCorpusRequiredDetails +
                                                  FundYouMustDetails;

                                                // Asset mapped values
                                                const CurrenAssetcurrentvalue =
                                                  event.target.value;

                                                // var assetallocatedvalue =
                                                //   (100 *
                                                //     Number(
                                                //       CurrenAssetcurrentvalue
                                                //     )) /
                                                //   friend.assetremainingvalue;

                                              
                                                
                                                var assetallocatedvalue =
                                                (100 *
                                                  Number(
                                                    CurrenAssetcurrentvalue
                                                  )) /
                                                friend.assetcurrentvalue;

                                                var AssetFutureValueData = GoalCalculation.AssetMappedValue(
                                                  Number(CurrenAssetcurrentvalue),
                                                  friend.assetgrowthrate,
                                                  NoOfYearsLeftForRetirementValues
                                                );

                                                setFieldValue(
                                                  (friend.mappedpercentage = "")
                                                );

                                                setFieldValue(
                                                  (friend.assetallocatedvalue = 0)
                                                );
                                                setFieldValue(
                                                  (friend.assetallocatedvalue = Number(
                                                    CurrenAssetcurrentvalue
                                                  )),
                                                  (friend.mappedpercentage = assetallocatedvalue.toFixed(
                                                    0
                                                  )),
                                                  (friend.assetfuturevalue = AssetFutureValueData.toFixed(
                                                    0
                                                  ))
                                                );

                                                var assetallocatedvalueDetails = 0;
                                                {
                                                  (
                                                    values.assetAllocation || []
                                                  ).map(
                                                    (assetAllocationDetail) =>
                                                      (assetallocatedvalueDetails +=
                                                        Number(assetAllocationDetail.assetfuturevalue))
                                                  );
                                                }

                                                var AssetMappedValueData = GoalCalculation.AssetMappedValue(
                                                  assetallocatedvalueDetails,
                                                  0,
                                                  1
                                                );

                                                if (
                                                  Number(
                                                    TotalCorpusRequiredDetails
                                                  ) <
                                                  Number(AssetMappedValueData)
                                                ) {
                                                  
                                                  setFieldValue(
                                                    (friend.assetallocatedvalue = ""),
                                                    (friend.mappedpercentage = ""),
                                                    (friend.assetfuturevalue = "")
                                                  )
                                                  warning(
                                                    "Asset mapped values should not be greater than total retirement corpus...!",
                                                    warningNotification
                                                  );
                                                  return;
                                                }

                                                if (
                                                  Number(
                                                    friend.assetremainingvalue
                                                  ) <
                                                  Number(
                                                    friend.assetallocatedvalue
                                                  )
                                                ) {
                                                  setFieldValue(
                                                    (friend.mappedpercentage = ""),
                                                    (friend.assetallocatedvalue = ""),
                                                    (friend.assetfuturevalue = "")
                                                  );
                                                  warning(
                                                    "Asset allocated values should not be greater than asset remaining value...!",
                                                    warningNotification
                                                  );
                                                  return;
                                                }
                                                //end asset mapped values

                                                var deficitValueData =
                                                  Number(
                                                    TotalCorpusRequiredDetails
                                                  ) -
                                                  Number(AssetMappedValueData);
                                                // RetirementCorpusRequiredDetails +
                                                // FundYouMustDetails;

                                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                                  AssetMappedValueData,
                                                  TotalCorpusRequiredDetails
                                                );

                                                lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                                  values.expectedPreRetirementReturn,
                                                  NoOfYearsLeftForRetirementValues,
                                                  deficitValueData
                                                );

                                                SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                                  values.expectedPreRetirementReturn,
                                                  NoOfYearsLeftForRetirementValues,
                                                  deficitValueData
                                                );
                                                window.focus();
                                                setFieldValue(
                                                  (values.retirementYear =
                                                    values.goalStartYear +
                                                    NoOfYearsLeftForRetirementValues),
                                                  (values.NoOfYearsLeftForRetirement = NoOfYearsLeftForRetirementValues),
                                                  (values.YearsAfterRetirement = YearsAfterRetirementValues),
                                                  (values.FirstMonthExpenseAfterRetirement = FirstMonthExpenseAfterRetirementDetails.toFixed(
                                                    0
                                                  )),
                                                  (values.RetirementCorpusRequired = RetirementCorpusRequiredDetails.toFixed(
                                                    0
                                                  )),
                                                  (values.FundYouMust = FundYouMustDetails.toFixed(
                                                    0
                                                  )),
                                                  (values.targetValue = TotalCorpusRequiredDetails.toFixed(
                                                    0
                                                  )),
                                                  (values.assetMappedValue = AssetMappedValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.goalAchievementScaleValues = [
                                                    GoalAchievementScaleData.toFixed(
                                                      0
                                                    ),
                                                  ]),
                                                  (values.deficitValue = deficitValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.lumSumValue = lumSumValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.sipValue = SIPValueData.toFixed(
                                                    0
                                                  ))
                                                );

                                                //#endregion
                                              }
                                            }}
                                          />
                                          {errors &&
                                            errors.assetAllocation &&
                                            errors.assetAllocation[index] &&
                                            errors.assetAllocation[index]
                                              .assetallocatedvalue &&
                                            touched &&
                                            touched.assetAllocation &&
                                            touched.assetAllocation[index] &&
                                            touched.assetAllocation[index]
                                              .assetallocatedvalue && (
                                              <div className="text-danger">
                                                {
                                                  errors.assetAllocation[index]
                                                    .assetallocatedvalue
                                                }
                                              </div>
                                            )}
                                          <span className="currency-word">
                                            <CurrencyWordFormat
                                              state={friend.assetallocatedvalue}
                                            ></CurrencyWordFormat>
                                          </span>
                                        </td>
                                        <td>
                                          <Field
                                            name={`assetAllocation.${index}.assetfuturevalue`}
                                            className="form-control"
                                            value={friend.assetfuturevalue}
                                            placeholder="Asset Current Value (INR)"
                                            disabled
                                          />

                                          {errors &&
                                            errors.assetAllocation &&
                                            errors.assetAllocation[index] &&
                                            errors.assetAllocation[index]
                                              .assetfuturevalue &&
                                            touched &&
                                            touched.assetAllocation &&
                                            touched.assetAllocation[index] &&
                                            touched.assetAllocation[index]
                                              .assetfuturevalue && (
                                              <div className="text-danger">
                                                {
                                                  errors.assetAllocation[index]
                                                    .assetfuturevalue
                                                }
                                              </div>
                                            )}
                                          <span className="currency-word">
                                            <CurrencyWordFormat
                                              state={friend.assetfuturevalue}
                                            ></CurrencyWordFormat>
                                          </span>
                                        </td>    
                                        <td className="text-center">
                                          <button
                                            type="button"
                                            className="btn-8 ml-5 mr-5 mt-10 plus-sign"
                                            onClick={() => {
                                              const {
                                                id,
                                              } = this.props.match.params;
                                              arrayHelpers.insert(index + 1, {
                                                partyassetid: "",
                                                partyId: id,
                                                partygoalid: "",
                                                assetallocatedvalue: "",
                                                mappedpercentage: "",
                                                assetremainingvalue: "",
                                                assetallocationpercentage: "",
                                                assetcurrentvalue: "",
                                                description: "",
                                                goalassetallocationid: "",
                                              });
                                            }}
                                          >
                                            <i
                                              className="fa fa-plus"
                                              aria-hidden="true"
                                            ></i>
                                          </button>
                                          <button
                                            type="button"
                                            className="btn-8 ml-5 mr-5 mt-10 mins-sign"
                                            onClick={(e) => {
                                              // this._showloaderonForm();

                                              if (values.retirement === false) {
                                                var yearGap =
                                                  Number(values.goalYear) -
                                                  Number(values.goalStartYear);
                                                setFieldValue(
                                                  (values.yearGap = yearGap)
                                                );

                                                // var assetallocatedvalueDetails = 0;
                                                // {
                                                //   (
                                                //     values.assetAllocation || []
                                                //   ).map(
                                                //     (assetAllocationDetail) =>
                                                //       (assetallocatedvalueDetails +=
                                                //         assetAllocationDetail.assetallocatedvalue)
                                                //   );
                                                // }

                                                var AssetMappedValueData = GoalCalculation.AssetMappedValueDataAllocation(
                                                  friend.assetallocatedvalue,
                                                  values.inflationRateValues,
                                                  values.yearGap
                                                );

                                                const assetallocatedvalue = (
                                                  Number(
                                                    values.assetMappedValue
                                                  ) -
                                                  Number(AssetMappedValueData)
                                                ).toFixed(0);

                                                console.log(
                                                  assetallocatedvalue
                                                );

                                                if (
                                                  Number(values.targetValue) <
                                                  Number(assetallocatedvalue)
                                                ) {
                                                  warning(
                                                    "Asset mapped values should not be greater than target value...!",
                                                    warningNotification
                                                  );
                                                  return;
                                                }

                                                var deficitValueData =
                                                  Number(values.targetValue) -
                                                  Number(
                                                    assetallocatedvalue
                                                  ).toFixed(0);
                                                // setFieldValue(
                                                //   (values.deficitValue = deficitValueData)
                                                // );
                                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                                  assetallocatedvalue,
                                                  values.targetValue
                                                );

                                                var lumSumValueData = GoalCalculation.lumSumValueData(
                                                  deficitValueData,
                                                  values.growthRateValues,
                                                  values.yearGap
                                                ).toFixed(0);

                                                var SIPValueData = GoalCalculation.SIPValueData(
                                                  deficitValueData,
                                                  values.growthRateValues,
                                                  values.yearGap
                                                ).toFixed(0);

                                                setFieldValue(
                                                  (values.assetMappedValue = assetallocatedvalue),
                                                  (values.deficitValue = deficitValueData.toFixed(
                                                    0
                                                  )),
                                                  (values.goalAchievementScaleValues = [
                                                    GoalAchievementScaleData.toFixed(
                                                      0
                                                    ),
                                                  ]),
                                                  (values.lumSumValue = lumSumValueData),
                                                  (values.sipValue =
                                                    SIPValueData === "Infinity"
                                                      ? 0
                                                      : SIPValueData),
                                                  (values.AssetAllocationAddNewRow =
                                                    Number(
                                                      assetallocatedvalue
                                                    ) === 0
                                                      ? true
                                                      : false)
                                                );
                                              } else {
                                               
                                                //#region retirementCalculation
                                                var NoOfYearsLeftForRetirementValues =
                                                  values.retirementAge -
                                                  values.currentAge;
                                                var YearsAfterRetirementValues =
                                                  values.lifeExpectancy -
                                                  values.retirementAge;

                                                var FirstMonthExpenseAfterRetirementDetails = GoalCalculation.FirstMonthExpense(
                                                  values.currentHouseAndLifeStyleExpenses,
                                                  values.inflationRateValuesRetirement,
                                                  NoOfYearsLeftForRetirementValues
                                                );

                                                var FirstYearExpenseAfterRetirementPostDetails =
                                                  Number(
                                                    FirstMonthExpenseAfterRetirementDetails
                                                  ) * 12;

                                                var FirstYearExpenseAfterRetirementPre =
                                                  FirstYearExpenseAfterRetirementPostDetails /
                                                  (1 - 0.2);

                                                var RateOtherhideCalculation = GoalCalculation.RateOtherhideCalculation(
                                                  values.expectedPostRetirementReturn,
                                                  values.inflationRateValuesRetirement
                                                );

                                                // var RetirementCorpusRequiredDetails = GoalCalculation.RetirementCorpusRequiredDetails(
                                                //   RateOtherhideCalculation,
                                                //   YearsAfterRetirementValues,
                                                //   FirstYearExpenseAfterRetirementPre
                                                // );

                                                // var FundYouMustDetails = GoalCalculation.FundYouMustDetails(
                                                //   values.expectedPreRetirementReturn,
                                                //   YearsAfterRetirementValues,
                                                //   RetirementCorpusRequiredDetails
                                                // );

                                                // var TotalCorpusRequiredDetails =
                                                //   RetirementCorpusRequiredDetails +
                                                //   FundYouMustDetails;

                                                // Asset mapped values

                                                debugger;
                                                var AssetMappedValueData = GoalCalculation.AssetMappedValueDataAllocation(
                                                  friend.assetallocatedvalue,
                                                  values.inflationRateValuesRetirement,
                                                  NoOfYearsLeftForRetirementValues
                                                );

                                                const assetallocatedvalue =
                                                  Number(
                                                    values.assetMappedValue
                                                  ) -
                                                  Number(AssetMappedValueData);

                                                // setFieldValue(
                                                //   (values.assetMappedValue = assetallocatedvalue)
                                                // );

                                                if (
                                                  Number(
                                                    values.targetValue
                                                  ) <
                                                  Number(assetallocatedvalue)
                                                ) {
                                                  warning(
                                                    "Asset mapped values should not be greater than target value...!",
                                                    warningNotification
                                                  );

                                                  
                                                  // $("input[name={assetAllocation.${index}.assetallocatedvalue`
                                                   var rowCount = $('#tab_logic tr').length;
                                                   console.log('assetAllocation."+(rowCount-1)+".mappedpercentage');
                                                   console.log('assetAllocation."+(rowCount-1)+".mappedpercentage');
                                                   $("input[name='assetAllocation."+(rowCount-1)+".mappedpercentage']").val(0);
                                                   $("input[name='assetAllocation."+(rowCount-1)+".assetallocatedvalue']").val(0);
                                                                                               

                                                  return;
                                                }

                                                var deficitValueData =
                                                  Number(
                                                    values.targetValue
                                                  ) -
                                                  Number(
                                                    assetallocatedvalue
                                                  ).toFixed(0);

                                                //end Asset mapped values

                                                var GoalAchievementScaleData = GoalCalculation.GoalAchievementScaleData(
                                                  assetallocatedvalue,
                                                  values.targetValue
                                                );

                                                lumSumValueData = GoalCalculation.lumSumValueDataRetirement(
                                                  values.expectedPreRetirementReturn,
                                                  NoOfYearsLeftForRetirementValues,
                                                  deficitValueData
                                                );

                                                lumSumValueData = lumSumValueData.toFixed(
                                                  0
                                                );

                                                SIPValueData = GoalCalculation.SIPValueDataRetirement(
                                                  values.expectedPreRetirementReturn,
                                                  NoOfYearsLeftForRetirementValues,
                                                  deficitValueData
                                                );
                                                SIPValueData = SIPValueData.toFixed(
                                                  0
                                                );

                                                let assetallocatedvalueadjust = assetallocatedvalue < 5 ? 0 : assetallocatedvalue;
                                                setFieldValue(
                                                  (values.deficitValue = deficitValueData),
                                                  (values.assetMappedValue = assetallocatedvalueadjust.toFixed(
                                                    0
                                                  )),
                                                  (values.lumSumValue = lumSumValueData),
                                                  (values.sipValue = SIPValueData),

                                                  (values.goalAchievementScaleValues = [
                                                    Number(
                                                      GoalAchievementScaleData.toFixed(
                                                        0
                                                      )
                                                    ),
                                                  ]),

                                                  (values.AssetAllocationAddNewRow =
                                                    Number(
                                                      values.assetMappedValue
                                                    ) === 0
                                                      ? true
                                                      : false)
                                                );
                                                //#endregion retirementCalculation
                                              }

                                             

                                              const userId = this.props.user
                                                .user.userId;
                                              const goalassetallocationid =
                                                friend.goalassetallocationid;
                                              if (
                                                goalassetallocationid !== ""
                                              ) {
                                                assetAllocationService.deleteAssetAllocation(
                                                  goalassetallocationid,
                                                  userId,
                                                  (res) => {
                                                    if (
                                                      res.data.status ===
                                                      "success"
                                                    ) {
                                                      success(
                                                        "Goal Asset record deleted successfully.",
                                                        successNotification
                                                      );
                                                      // this._LoadDataTable();
                                                      //  arrayHelpers.remove(index);
                                                    } else {
                                                      success(
                                                        "Something went wrong.",
                                                        warningNotification
                                                      );
                                                    }
                                                  }
                                                );
                                                // this._hideloaderonForm();
                                              } else {
                                                arrayHelpers.remove(index);
                                                //  this._hideloaderonForm();
                                              }
                                              arrayHelpers.remove(index);
                                              // if (index === 0) {
                                              //   warning(
                                              //     "We can't remove first entry...!",
                                              //     warningNotification
                                              //   );
                                              // } else {
                                              //   arrayHelpers.remove(index);
                                              // }
                                            }}
                                          >
                                            <i
                                              className="fa fa-minus "
                                              aria-hidden="true"
                                            ></i>
                                          </button>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      ></FieldArray>
                    </div>
                    <div className="border"></div>
                    <div className="goal-sub-title">Goal Commentary</div>
                    <div className="CKEditorallocation CKspace">
                      <CKEditor
                        data={values.ckEditordata}
                        name="ckEditordata"
                        onChange={(event) => {
                          setFieldValue(
                            (values.ckEditordata = event.editor.getData())
                          );
                        }}
                      />
                    </div>
                    <div className="border"></div>
                    <div className="space-15"></div>
                    <button
                      className="btn btn-primary blue-btn pull-right"
                      onClick={this._hideForm}
                      disabled={this.state.updateState}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary blue-btn pull-right btn-space"
                      type="submit"
                    >
                      SAVE
                    </button>
                    <div className="clearfix"></div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        ) : null}
        <div className="table-top-box">
          <div className="col-sm-12 col-md-6 pro-pl">
            <div className="all-title-table">Goal List</div>
          </div>
          <div className="col-sm-12 col-md-6 pro-pr">
            <input
              className="form-control pull-right searchbox"
              type="text"
              placeholder="Search"
              aria-label="Search"
              autoFocus
              value={this.state.filterAll}
              onChange={this.filterAll}
            />
            <button
              className="blue-btn pull-right"
              onClick={() => {
                this.setState({ showForm: true });
              }}
            >
              Add
            </button>
          </div>

          <div className="clearfix"></div>
        </div>
        <ReactTable
          className="gray-box2"
          // bind data on table
          filtered={this.state.filtered}
          data={this.props.goalData || []}
          columns={columns} // bind column to grid
          defaultPageSize={10} //by Default row size
          pageSizeOptions={[5, 10, 15]} // display row on page
        />
        <div className="space-20"></div>
        <div className="border"></div>
        <div className="space-15"></div>
        <button
          className="btn btn-primary blue-btn pull-right"
          type="submit"
          onClick={this.Redirect}
        >
          Save & Next
        </button>
        <button
          className="btn btn-primary blue-btn pull-right btn-space"
          onClick={this.RedirectBack}
        >
          Back
        </button>
        <div className="clearfix"></div>
        <div className="space-15"></div>
      </div>
    );
  }
}

export default GoalPage;
