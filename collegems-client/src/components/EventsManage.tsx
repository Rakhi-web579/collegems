import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "../api/axios";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Mail,
  Phone,
  User,
  Building,
  Image,
  CheckCircle,
  XCircle,
  FileText,
  Tag,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Target,
  BookOpen,
} from 'lucide-react';

interface EventForm {
    title: string;
    shortDescription: string;
    description: string;
    category: string;
    mode: 'online' | 'offline' | 'hybrid';
    organization: string;
    speaker: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
    meetingLink: string;
    coverImage: string;
    registrationRequired: boolean;
    maxParticipants: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    prerequisites?: string;
    targetAudience?: string;
    tags?: string;
}

export default function EventsManage() {
    const [form, setForm] = useState<EventForm>({
        title: "",
        shortDescription: "",
        description: "",
        category: "Workshop",
        mode: "online",
        organization: "",
        speaker: "",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        meetingLink: "",
        coverImage: "",
        registrationRequired: false,
        maxParticipants: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        prerequisites: "",
        targetAudience: "",
        tags: "",
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(1);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axios.post("/events/create", form);
            setSuccess(true);

            setTimeout(() => {
                setForm({
                    title: "",
                    shortDescription: "",
                    description: "",
                    category: "Workshop",
                    mode: "online",
                    organization: "",
                    speaker: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    venue: "",
                    meetingLink: "",
                    coverImage: "",
                    registrationRequired: false,
                    maxParticipants: "",
                    contactName: "",
                    contactEmail: "",
                    contactPhone: "",
                    prerequisites: "",
                    targetAudience: "",
                    tags: "",
                });
                setCurrentStep(1);
                setSuccess(false);
            }, 3000);
        } catch (err) {
            console.error(err);
            setError("Error creating workshop. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const inputClassName = "w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900";
    const labelClassName = "block text-sm font-medium text-gray-700 mb-1.5";

    const categories = [
        "Workshop",
        "Seminar",
        "Webinar",
        "Alumni Talk",
        "Training",
        "Conference",
        "Hackathon",
        "Guest Lecture"
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
                            <p className="text-gray-500 mt-1">Fill in the details to create a workshop, seminar, or webinar</p>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-emerald-700">Event created successfully! 🎉</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                        <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-rose-600" />
                        </div>
                        <span className="text-rose-700">{error}</span>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[
                            { step: 1, label: "Basic Info", icon: FileText },
                            { step: 2, label: "Schedule & Venue", icon: Calendar },
                            { step: 3, label: "Contact Details", icon: Users },
                        ].map((item, index) => {
                            const Icon = item.icon;
                            const isActive = currentStep === item.step;
                            const isCompleted = currentStep > item.step;

                            return (
                                <div key={item.step} className="flex items-center flex-1">
                                    <div className="relative">
                                        <div className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all
                                            ${isCompleted ? 'bg-blue-600 text-white' : ''}
                                            ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                                            ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-500' : ''}
                                        `}>
                                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                    </div>
                                    <div className={`ml-3 flex-1 ${index < 2 ? 'mr-4' : ''}`}>
                                        <p className={`text-sm font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {item.label}
                                        </p>
                                    </div>
                                    {index < 2 && (
                                        <div className={`flex-1 h-0.5 ${currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Form Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                        <h2 className="font-semibold text-gray-900">
                            Step {currentStep}: {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Schedule & Venue" : "Contact Information"}
                        </h2>
                    </div>

                    {/* Form Body */}
                    <div className="p-6">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className={labelClassName}>Event Title *</label>
                                        <input
                                            name="title"
                                            value={form.title}
                                            placeholder="e.g., Advanced Machine Learning Workshop"
                                            onChange={handleChange}
                                            className={inputClassName}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Short Description *</label>
                                        <input
                                            name="shortDescription"
                                            value={form.shortDescription}
                                            placeholder="Brief overview (max 200 characters)"
                                            onChange={handleChange}
                                            className={inputClassName}
                                            maxLength={200}
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            {form.shortDescription.length}/200 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Detailed Description *</label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            placeholder="Full description of the event..."
                                            onChange={handleChange}
                                            rows={5}
                                            className={`${inputClassName} resize-none`}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClassName}>Category *</label>
                                            <select name="category" value={form.category} onChange={handleChange} className={inputClassName}>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Mode *</label>
                                            <select name="mode" value={form.mode} onChange={handleChange} className={inputClassName}>
                                                <option value="online">Online</option>
                                                <option value="offline">Offline</option>
                                                <option value="hybrid">Hybrid</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Organization *</label>
                                            <input
                                                name="organization"
                                                value={form.organization}
                                                placeholder="e.g., Google, Microsoft"
                                                onChange={handleChange}
                                                className={inputClassName}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClassName}>Speaker *</label>
                                            <input
                                                name="speaker"
                                                value={form.speaker}
                                                placeholder="Full name of speaker"
                                                onChange={handleChange}
                                                className={inputClassName}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Schedule and Venue */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClassName}>Date *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="date"
                                                name="date"
                                                value={form.date}
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Start Time *</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="startTime"
                                                value={form.startTime}
                                                placeholder="e.g., 10:00 AM"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClassName}>End Time *</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="endTime"
                                                value={form.endTime}
                                                placeholder="e.g., 4:00 PM"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {(form.mode === "offline" || form.mode === "hybrid") && (
                                        <div>
                                            <label className={labelClassName}>Venue</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    name="venue"
                                                    value={form.venue}
                                                    placeholder="Full address"
                                                    onChange={handleChange}
                                                    className={`${inputClassName} pl-10`}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(form.mode === "online" || form.mode === "hybrid") && (
                                        <div>
                                            <label className={labelClassName}>Meeting Link</label>
                                            <div className="relative">
                                                <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    name="meetingLink"
                                                    value={form.meetingLink}
                                                    placeholder="https://meet.google.com/..."
                                                    onChange={handleChange}
                                                    className={`${inputClassName} pl-10`}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className={labelClassName}>Cover Image URL *</label>
                                        <div className="relative">
                                            <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                name="coverImage"
                                                value={form.coverImage}
                                                placeholder="https://example.com/image.jpg"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Target Audience</label>
                                        <div className="relative">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                name="targetAudience"
                                                value={form.targetAudience}
                                                placeholder="e.g., Students, Professionals"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Prerequisites</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                name="prerequisites"
                                                value={form.prerequisites}
                                                placeholder="e.g., Basic Python knowledge"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClassName}>Tags (comma separated)</label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                name="tags"
                                                value={form.tags}
                                                placeholder="e.g., AI, Machine Learning, Python"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="registrationRequired"
                                                checked={form.registrationRequired}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Registration Required</span>
                                        </label>
                                    </div>

                                    {form.registrationRequired && (
                                        <div>
                                            <label className={labelClassName}>Max Participants</label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="number"
                                                    name="maxParticipants"
                                                    value={form.maxParticipants}
                                                    placeholder="e.g., 100"
                                                    onChange={handleChange}
                                                    className={`${inputClassName} pl-10`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact Information */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClassName}>Contact Person *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                name="contactName"
                                                value={form.contactName}
                                                placeholder="Full name"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Contact Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                name="contactEmail"
                                                value={form.contactEmail}
                                                placeholder="email@example.com"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClassName}>Contact Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="tel"
                                                name="contactPhone"
                                                value={form.contactPhone}
                                                placeholder="+91 98765 43210"
                                                onChange={handleChange}
                                                className={`${inputClassName} pl-10`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-between">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Create Event
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>

                {/* Live Preview */}
                {form.title && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-gray-500" />
                            Live Preview
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {form.coverImage && (
                                <div className="relative h-48 bg-gray-100">
                                    <img
                                        src={form.coverImage}
                                        alt={form.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/placeholder-800x400';
                                        }}
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-sm font-medium rounded-full">
                                            {form.category}
                                        </span>
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-600 text-sm font-medium rounded-full capitalize">
                                            {form.mode}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="p-6">
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{form.title}</h4>
                                <p className="text-gray-600 mb-4">{form.shortDescription || "No description provided"}</p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{form.date || "Date TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>{form.startTime ? `${form.startTime} - ${form.endTime}` : "Time TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>{form.speaker || "Speaker TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building className="w-4 h-4 text-gray-400" />
                                        <span>{form.organization || "Organization TBD"}</span>
                                    </div>
                                    {(form.mode === "offline" || form.mode === "hybrid") && form.venue && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">{form.venue}</span>
                                        </div>
                                    )}
                                    {(form.mode === "online" || form.mode === "hybrid") && form.meetingLink && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Video className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">Online Meeting</span>
                                        </div>
                                    )}
                                </div>

                                {form.tags && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {form.tags.split(',').map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                                            >
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}