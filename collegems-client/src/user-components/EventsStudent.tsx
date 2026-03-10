import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Calendar,
  MapPin,
  Video,
  Users,
  Clock,
  User,
  Building,
  ExternalLink,
  Filter,
  Search,
  X,
  Tag,
  ChevronRight,
  Download,
  Globe,
  CalendarDays,
  Mail,
  Phone,
  BookOpen,
  Info,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Workshop {
    _id: string;
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
    venue?: string;
    meetingLink?: string;
    coverImage: string;
    registrationRequired: boolean;
    maxParticipants?: number;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    prerequisites?: string;
    targetAudience?: string;
    tags?: string;
    createdAt: string;
}

export default function EventsStudent() {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedMode, setSelectedMode] = useState<string>("all");
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    // Get unique categories
    const categories = ["all", ...new Set(workshops.map(w => w.category))];
    const modes = ["all", "online", "offline", "hybrid"];

    useEffect(() => {
        fetchWorkshops();
    }, []);

    useEffect(() => {
        filterWorkshops();
    }, [searchTerm, selectedCategory, selectedMode, workshops]);

    const fetchWorkshops = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/events");
            setWorkshops(res.data.data);
            setFilteredWorkshops(res.data.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load workshops. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filterWorkshops = () => {
        let filtered = workshops;

        if (searchTerm) {
            filtered = filtered.filter(w =>
                w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(w => w.category === selectedCategory);
        }

        if (selectedMode !== "all") {
            filtered = filtered.filter(w => w.mode === selectedMode);
        }

        setFilteredWorkshops(filtered);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("all");
        setSelectedMode("all");
    };

    const handleViewDetails = (workshop: Workshop) => {
        setSelectedWorkshop(workshop);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedWorkshop(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getModeColor = (mode: string) => {
        switch (mode) {
            case 'online': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'offline': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'hybrid': return 'bg-purple-50 text-purple-700 border-purple-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'online': return <Video className="w-4 h-4" />;
            case 'offline': return <MapPin className="w-4 h-4" />;
            case 'hybrid': return <Globe className="w-4 h-4" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading workshops...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Unable to load workshops
                    </h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchWorkshops}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Loader2 className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Workshops & Events</h1>
                <p className="text-gray-500 mt-1">Discover and join upcoming workshops, seminars, and webinars</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, speaker, organization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden px-4 py-2 border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>

                    {/* Desktop Filters */}
                    <div className="hidden lg:flex items-center gap-3">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            {modes.map(mode => (
                                <option key={mode} value={mode}>
                                    {mode === 'all' ? 'All Modes' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </option>
                            ))}
                        </select>

                        {(searchTerm || selectedCategory !== "all" || selectedMode !== "all") && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Filters */}
                {showFilters && (
                    <div className="lg:hidden mt-4 space-y-3 pt-4 border-t border-gray-200">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            {modes.map(mode => (
                                <option key={mode} value={mode}>
                                    {mode === 'all' ? 'All Modes' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </option>
                            ))}
                        </select>

                        {(searchTerm || selectedCategory !== "all" || selectedMode !== "all") && (
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Results Stats */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-700">{filteredWorkshops.length}</span> workshops
                </p>
                <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* Workshops Grid */}
            {filteredWorkshops.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No workshops found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorkshops.map((workshop) => (
                        <div
                            key={workshop._id}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                        >
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                    src={workshop.coverImage || 'https://via.placeholder.com/800x400?text=Workshop'}
                                    alt={workshop.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Workshop';
                                    }}
                                />

                                {/* Category Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg border border-gray-200">
                                        {workshop.category}
                                    </span>
                                </div>

                                {/* Mode Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border ${getModeColor(workshop.mode)}`}>
                                        {getModeIcon(workshop.mode)}
                                        {workshop.mode.charAt(0).toUpperCase() + workshop.mode.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                                    {workshop.title}
                                </h3>

                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {workshop.shortDescription}
                                </p>

                                {/* Speaker & Organization */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{workshop.speaker}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{workshop.organization}</span>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>{formatDate(workshop.date)}</span>
                                    <Clock className="w-4 h-4 text-gray-400 ml-2" />
                                    <span>{workshop.startTime}</span>
                                </div>

                                {/* Tags */}
                                {workshop.tags && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {workshop.tags.split(',').map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg flex items-center gap-1"
                                            >
                                                <Tag className="w-3 h-3" />
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewDetails(workshop)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        Details
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    {workshop.mode !== 'offline' && workshop.meetingLink && (
                                        <a
                                            href={workshop.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Workshop Details Modal */}
            {showModal && selectedWorkshop && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="relative h-56 bg-gray-100">
                            <img
                                src={selectedWorkshop.coverImage || 'https://via.placeholder.com/1200x400?text=Workshop'}
                                alt={selectedWorkshop.title}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>

                            {/* Badges */}
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                                    {selectedWorkshop.category}
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 border ${getModeColor(selectedWorkshop.mode)}`}>
                                    {getModeIcon(selectedWorkshop.mode)}
                                    {selectedWorkshop.mode.charAt(0).toUpperCase() + selectedWorkshop.mode.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedWorkshop.title}</h2>

                            {/* Key Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Speaker:</span> {selectedWorkshop.speaker}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Building className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Organization:</span> {selectedWorkshop.organization}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Date:</span> {formatDate(selectedWorkshop.date)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Time:</span> {selectedWorkshop.startTime} - {selectedWorkshop.endTime}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-gray-400" />
                                        About this Workshop
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{selectedWorkshop.description}</p>
                                </div>

                                {selectedWorkshop.prerequisites && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-gray-400" />
                                            Prerequisites
                                        </h3>
                                        <p className="text-sm text-gray-600">{selectedWorkshop.prerequisites}</p>
                                    </div>
                                )}

                                {selectedWorkshop.targetAudience && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            Target Audience
                                        </h3>
                                        <p className="text-sm text-gray-600">{selectedWorkshop.targetAudience}</p>
                                    </div>
                                )}

                                {selectedWorkshop.mode !== 'online' && selectedWorkshop.venue && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            Venue
                                        </h3>
                                        <p className="text-sm text-gray-600">{selectedWorkshop.venue}</p>
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4 text-gray-400" />
                                            {selectedWorkshop.contactName}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {selectedWorkshop.contactEmail}
                                        </div>
                                        {selectedWorkshop.contactPhone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {selectedWorkshop.contactPhone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedWorkshop.registrationRequired && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-amber-800">Registration Required</p>
                                                {selectedWorkshop.maxParticipants && (
                                                    <p className="text-sm text-amber-600 mt-1">
                                                        Maximum participants: {selectedWorkshop.maxParticipants}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Close
                                </button>
                                {selectedWorkshop.mode !== 'offline' && selectedWorkshop.meetingLink && (
                                    <a
                                        href={selectedWorkshop.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <Video className="w-4 h-4" />
                                        Join Workshop
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}