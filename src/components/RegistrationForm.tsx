// components/RegistrationForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormInputs = {
  id?: string;
  fullName: string;
  photo: FileList | string;
  phoneNumber: string;
  university: string;
  responsibility: string;
  honor: string;
  barcode?: string;
  gender?: string;
};

const responsibilities = [
  "Athlete",
  "Coach",
  "Driver",
  "Guest",
  "HOD",
  "Media",
  "Medical staff",
  "Support staff",
  "VIP Guest",
];

const honor = [
  "None",
  "PhD", 
];

const gender = [
  "Female",
  "Male",
]

interface RegistrationFormProps {
  editingParticipant?: FormInputs | null;
}

export function RegistrationForm({ editingParticipant }: RegistrationFormProps) {
  const { data: session } = useSession();
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormInputs>({
    defaultValues: {
      responsibility: '',
      honor: '',
      gender: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  }
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResponsibility, setLastResponsibility] = useState<string>(
    responsibilities[0]
  );

  useEffect(() => {
    if (editingParticipant) {
      reset(editingParticipant);
      setPhotoPreview(editingParticipant.photo as string);
      setLastResponsibility(editingParticipant.responsibility);
    } else {
      reset({ responsibility: lastResponsibility });
    }

    if (session?.user?.name) {
      setValue("university", session.user.name);
    }
  }, [editingParticipant, reset, session?.user?.name, setValue]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitForm: SubmitHandler<FormInputs> = async (data) => {
    try {
      setIsSubmitting(true);
  
      let photoData: string | undefined = typeof data.photo === 'string' ? data.photo : undefined;
  
      if (data.photo instanceof FileList && data.photo.length > 0) {
        const file = data.photo[0];
        photoData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string);
            } else {
              reject(new Error('Failed to read photo file.'));
            }
          };
          reader.onerror = () => reject(new Error('Error reading photo file.'));
          reader.readAsDataURL(file);
        });
      }
  
      const payload = {
        id: editingParticipant?.id,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        university: session?.user?.name,
        responsibility: data.responsibility,
        honor: data.honor!= 'None' ? data.honor : '',
        photo: photoData,
        gender: data.gender,
      };
  
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to submit form. Status: ${response.status}`);
      }
  
      console.log('Participant successfully updated.');
  
      // Store the last responsibility
      setLastResponsibility(data.responsibility);
      
      // Reset form to initial state
      reset({
        fullName: '',
        photo: '',
        phoneNumber: '',
        honor: '',
        gender: '',
        university: session?.user?.name || '',
        responsibility: data.responsibility, // Keep the last selected responsibility
      });
      
      // Clear photo preview
      setPhotoPreview(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
  
    } catch (error) {
      console.error('Error submitting participant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className='container mx-auto px-4 py-8 flex flex-col'>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            {...register("fullName", { required: "Full name is required" })}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="gender">Select gender</Label>
          <Select
            onValueChange={(value) => {
              setValue("gender", value);
            }}
            value={watch("gender")}
            {...register("gender", { 
              required: "Gender is required",
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {gender.map((resp) => (
                <SelectItem key={resp} value={resp}>
                  {resp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="honor">Do you have PhD?</Label>
          <Select
            onValueChange={(value) => {
              setValue("honor", value);
            }}
            value={watch("honor")}
          >
            <SelectTrigger>
              <SelectValue placeholder="(Optional)" />
            </SelectTrigger>
            <SelectContent>
              {honor.map((resp) => (
                <SelectItem key={resp} value={resp}>
                  {resp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="photo">Photo Upload</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            {...register("photo", { 
              required: !editingParticipant && "Photo is required",
              onChange: handlePhotoChange 
            })}
          />
          {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo.message}</p>}
          {photoPreview && (
            <div className="relative mt-2 w-32 h-32 rounded-full overflow-hidden">
              <div className="absolute inset-0">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover object-[50%_35%]"
                  style={{
                    objectFit: 'cover',
                    objectPosition: '50% 20%'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: {
                value: /^\d{10}$/,
                message: "Phone number must be 10 digits"
              }
            })}
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>

        <div>
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            value={session?.user?.name || ''}
            disabled
            className="bg-gray-100"
          />
        </div>

        <div>
          <Label htmlFor="responsibility">Responsibility</Label>
          <Select
            onValueChange={(value) => {
              setValue("responsibility", value);
              setLastResponsibility(value);
            }}
            value={watch("responsibility") || lastResponsibility}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a responsibility" />
            </SelectTrigger>
            <SelectContent>
              {responsibilities.map((resp) => (
                <SelectItem key={resp} value={resp}>
                  {resp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.responsibility && (
            <p className="text-red-500 text-xs mt-1">{errors.responsibility.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : editingParticipant ? 'Update Participant' : 'Register Participant'}
        </Button>
      </form>
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#cccccc] text-center text-[#003366] shadow-lg">
          <p className="text-base font-medium">
            &copy; ASCII Technologies <span className="text-[#b8860b]">2024</span>
          </p>
      </footer>
    </div>
  );
}