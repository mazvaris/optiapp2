import { useForm, FormProvider } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 90 }, (_, i) => currentYear - i);
};

const generateMonthOptions = () => {
  return [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];
};

const generateDayOptions = () => {
  return Array.from({ length: 31 }, (_, i) => i + 1);
};

interface DemographicsFormData {
  firstName: string;
  lastName: string;
  birthMonth?: string;
  birthDay?: string;
  yearOfBirth?: string;
  gender?: string;
  mobileContactNumber?: string;
  workContactNumber?: string;
  emailAddress?: string;
  preferredContactMethod?: string[];
  ethnicity?: string;
  ethnicityOther?: string;
  nationality?: string;
  nationalityOther?: string;
  homeAddressLine1?: string;
  homeAddressLine2?: string;
  homeCityTown?: string;
  postalAddressLine1?: string;
  postalAddressLine2?: string;
  postalCityTown?: string;
  identificationNumber?: string;
  occupation?: string;
  nokFirstName?: string;
  nokLastName?: string;
  nokRelationship?: string;
  nokRelationshipOther?: string;
  nokFirstContactNumber?: string;
  nokSecondContactNumber?: string;
  insurance?: string;
  insuranceProvider?: string;
  isPolicyHolder?: string;
  relationshipToMember?: string;
  memberNumber?: string;
  employerOrGovDept?: string;
}

const steps = ["Personal Info", "NOK", "Address Info", "Payment"];

interface PatientDemographicsFormProps {
  onSubmit: (data: DemographicsFormData) => void;
  initialData?: Partial<DemographicsFormData>;
  loading?: boolean;
}

export const PatientDemographicsForm = ({ onSubmit, initialData, loading = false }: PatientDemographicsFormProps) => {
  const methods = useForm<DemographicsFormData>({ 
    mode: "onTouched",
    defaultValues: initialData 
  });
  const [step, setStep] = useState(0);
  const [showPostalAddress, setShowPostalAddress] = useState(
    Boolean(initialData?.postalAddressLine1 || initialData?.postalAddressLine2 || initialData?.postalCityTown)
  );
  const [selectedContactMethods, setSelectedContactMethods] = useState<string[]>(initialData?.preferredContactMethod || []);
  const { watch, register, handleSubmit, formState: { errors }, setValue } = methods;

  const ethnicity = watch("ethnicity");
  const nationality = watch("nationality");
  const nokRelationship = watch("nokRelationship");
  const insurance = watch("insurance");
  const isPolicyHolder = watch("isPolicyHolder");

  const onNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const onBack = () => setStep((prev) => Math.max(prev - 1, 0));
  const goToStep = (stepIndex: number) => setStep(stepIndex);

  const handleContactMethodChange = (method: string, checked: boolean) => {
    let newMethods;
    if (checked) {
      newMethods = [...selectedContactMethods, method];
    } else {
      newMethods = selectedContactMethods.filter(m => m !== method);
    }
    setSelectedContactMethods(newMethods);
    setValue("preferredContactMethod", newMethods);
  };

  const handleFormSubmit = (data: DemographicsFormData) => {
    const formattedData = {
      ...data,
      preferredContactMethod: selectedContactMethods,
    };
    
    console.log("Form Data", formattedData);
    onSubmit(formattedData);
  };

  return (
    <FormProvider {...methods}>
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between mb-6">
            {steps.map((label, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToStep(index)}
                className={cn(
                  "px-4 py-2 rounded cursor-pointer text-sm font-medium transition-colors",
                  index === step ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    {...register("firstName", { required: "First name is required" })} 
                  />
                  {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    {...register("lastName", { required: "Last name is required" })} 
                  />
                  {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthMonth">Birth Month</Label>
                    <Select value={watch("birthMonth")} onValueChange={(value) => setValue("birthMonth", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateMonthOptions().map((month) => (
                          <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="birthDay">Birth Day</Label>
                    <Select value={watch("birthDay")} onValueChange={(value) => setValue("birthDay", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateDayOptions().map((day) => (
                          <SelectItem key={day} value={day.toString().padStart(2, '0')}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="yearOfBirth">Year of Birth</Label>
                  <Select value={watch("yearOfBirth")} onValueChange={(value) => setValue("yearOfBirth", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateYearOptions().map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={watch("gender")} onValueChange={(value) => setValue("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mobileContactNumber">Mobile Contact Number</Label>
                  <Input 
                    id="mobileContactNumber" 
                    {...register("mobileContactNumber")} 
                  />
                </div>

                <div>
                  <Label htmlFor="workContactNumber">Work Contact Number</Label>
                  <Input 
                    id="workContactNumber" 
                    {...register("workContactNumber")} 
                  />
                </div>

                <div>
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input 
                    id="emailAddress" 
                    type="email" 
                    {...register("emailAddress")} 
                  />
                </div>

                <div>
                  <Label>Preferred Contact Method</Label>
                  <div className="flex gap-4 mt-2">
                    {["Mobile Phone", "Work Phone", "Email", "SMS"].map((method) => (
                      <label key={method} className="flex items-center gap-2">
                        <Checkbox 
                          checked={selectedContactMethods.includes(method)}
                          onCheckedChange={(checked) => handleContactMethodChange(method, checked === true)}
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="ethnicity">Ethnicity</Label>
                  <Select value={watch("ethnicity")} onValueChange={(value) => setValue("ethnicity", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shona">Shona</SelectItem>
                      <SelectItem value="Ndebele">Ndebele</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {ethnicity === "Other" && (
                    <Input 
                      {...register("ethnicityOther")} 
                      placeholder="Please specify" 
                      className="mt-2"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select value={watch("nationality")} onValueChange={(value) => setValue("nationality", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zimbabwean">Zimbabwean</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {nationality === "Other" && (
                    <Input 
                      {...register("nationalityOther")} 
                      placeholder="Please specify" 
                      className="mt-2"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="identificationNumber">Identification Number</Label>
                  <Input 
                    id="identificationNumber" 
                    {...register("identificationNumber")} 
                  />
                </div>

                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input 
                    id="occupation" 
                    {...register("occupation")} 
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Next of Kin (NOK)</h3>
                
                <div>
                  <Label htmlFor="nokFirstName">First Name</Label>
                  <Input 
                    id="nokFirstName" 
                    {...register("nokFirstName")} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="nokLastName">Last Name</Label>
                  <Input 
                    id="nokLastName" 
                    {...register("nokLastName")} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="nokRelationship">Relationship</Label>
                  <Select value={watch("nokRelationship")} onValueChange={(value) => setValue("nokRelationship", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Husband">Husband</SelectItem>
                      <SelectItem value="Wife">Wife</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Dad">Dad</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {nokRelationship === "Other" && (
                    <Input 
                      {...register("nokRelationshipOther")} 
                      placeholder="Please specify relationship" 
                      className="mt-2"
                    />
                  )}
                </div>
                
                <div>
                  <Label htmlFor="nokFirstContactNumber">First Contact Number</Label>
                  <Input 
                    id="nokFirstContactNumber" 
                    {...register("nokFirstContactNumber")} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="nokSecondContactNumber">Second Contact Number</Label>
                  <Input 
                    id="nokSecondContactNumber" 
                    {...register("nokSecondContactNumber")} 
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Address Information</h3>
                
                <div>
                  <Label htmlFor="homeAddressLine1">Home Address - Line 1</Label>
                  <Input 
                    id="homeAddressLine1" 
                    {...register("homeAddressLine1")} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="homeAddressLine2">Home Address - Line 2</Label>
                  <Input id="homeAddressLine2" {...register("homeAddressLine2")} />
                </div>
                
                <div>
                  <Label htmlFor="homeCityTown">City/Town</Label>
                  <Input 
                    id="homeCityTown" 
                    {...register("homeCityTown")} 
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showPostalAddress" 
                    checked={showPostalAddress} 
                    onCheckedChange={(checked) => setShowPostalAddress(checked === true)} 
                  />
                  <Label htmlFor="showPostalAddress">Postal Address (if different)</Label>
                </div>
                
                {showPostalAddress && (
                  <div className="space-y-3 mt-4 p-4 bg-muted rounded-md">
                    <Input 
                      id="postalAddressLine1" 
                      {...register("postalAddressLine1")} 
                      placeholder="Postal Address Line 1" 
                    />
                    <Input 
                      id="postalAddressLine2" 
                      {...register("postalAddressLine2")} 
                      placeholder="Postal Address Line 2" 
                    />
                    <Input 
                      id="postalCityTown" 
                      {...register("postalCityTown")} 
                      placeholder="Postal City/Town" 
                    />
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Payment Information</h3>
                
                <div>
                  <Label htmlFor="insurance">Payment Type</Label>
                  <Select value={watch("insurance")} onValueChange={(value) => setValue("insurance", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Medical Aid">Medical Aid</SelectItem>
                      <SelectItem value="Cash & Medical Aid">Cash & Medical Aid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(insurance === "Medical Aid" || insurance === "Cash & Medical Aid") && (
                  <div className="space-y-4 p-4 bg-muted rounded-md">
                    <div>
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <Select value={watch("insuranceProvider")} onValueChange={(value) => setValue("insuranceProvider", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PSMAS">PSMAS</SelectItem>
                          <SelectItem value="National Medical Aid">National Medical Aid</SelectItem>
                          <SelectItem value="Alliance Health">Alliance Health</SelectItem>
                          <SelectItem value="CIMAS">CIMAS</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="isPolicyHolder">Are you the policy holder?</Label>
                      <Select value={watch("isPolicyHolder")} onValueChange={(value) => setValue("isPolicyHolder", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {isPolicyHolder === "No" && (
                      <div>
                        <Label htmlFor="relationshipToMember">Relationship to Member</Label>
                        <Select value={watch("relationshipToMember")} onValueChange={(value) => setValue("relationshipToMember", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Spouse">Spouse</SelectItem>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Sibling">Sibling</SelectItem>
                            <SelectItem value="Mother">Mother</SelectItem>
                            <SelectItem value="Father">Father</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="memberNumber">Member Number</Label>
                      <Input 
                        id="memberNumber" 
                        {...register("memberNumber")} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="employerOrGovDept">Employer or Government Dept</Label>
                      <Input 
                        id="employerOrGovDept" 
                        {...register("employerOrGovDept")} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              {step > 0 && (
                <Button 
                  type="button" 
                  onClick={onBack} 
                  variant="outline"
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              <div className="ml-auto">
                {step < steps.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={onNext} 
                    disabled={loading}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Submit Patient Information"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};